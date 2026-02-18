"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {useToast} from "@/hooks/use-toast";
import {useCsrfToken} from "@/hooks/use-csrf-token";
import { Editor } from '@/components/blocks/editor-00/editor';
import { SerializedEditorState } from 'lexical';
import { lexicalDefaultValue } from '@/lib/lexical-default-state';
import { parseContentToLexicalState } from '@/lib/lexical';

interface ServiceFormProps {
  service?: {
    id: number
    title: string
    slug: string
    description: string
    content: string
    icon: string
    order_index: number
    active: boolean
  }
}

export default function ServiceForm({ service }: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [title, setTitle] = useState(service?.title || "")
  const [description, setDescription] = useState(service?.description || "")
  const [content, setContent] = useState(service?.content || "")
  const [icon, setIcon] = useState(service?.icon || "")
  const [orderIndex, setOrderIndex] = useState(service?.order_index || 0)
  const [active, setActive] = useState(service?.active ?? true)

  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()
  const {csrfToken, setCsrfToken}  = useCsrfToken()

  const [editorState, setEditorState] = useState<SerializedEditorState>(
    parseContentToLexicalState(service?.content)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csrfToken) {
      toast({
        type: "error",
        title: "Security Error",
        description: "CSRF token missing. Refresh the page.",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = service ? `/api/services/${service.id}` : "/api/services"
      const method = service ? "PUT" : "POST"

      const body = {
        title,
        description,
        content,
        icon,
        order_index: orderIndex,
        active,
        csrfToken,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          type: "success",
          title: "Success",
          description: service ? "Service updated!" : "Service created!",
        })
        setTimeout(() => router.push("/admin/services"), 1000)
      } else {
        toast({
          type: "error",
          title: "Failed",
          description: data.error || `Server error (${res.status})`,
        })
        if (res.status === 403) setCsrfToken("") // force refresh token
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        title: "Network error",
        description: "Check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{service ? "Edit Service" : "Create New Service"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        <div className="">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter service title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the service"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <Editor
            editorSerializedState={editorState}
            onSerializedChange={(value) => {
              setEditorState(value)
              setContent(JSON.stringify(value))
            }}
          />
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
            Icon (Optional)
          </label>
          <input
            type="text"
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Icon name or URL"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active (visible on website)
          </label>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors inline-flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {service ? "Update Service" : "Create Service"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
