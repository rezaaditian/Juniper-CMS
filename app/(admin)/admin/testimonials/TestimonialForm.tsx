"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {useToast} from "@/hooks/use-toast";
import {useCsrfToken} from "@/hooks/use-csrf-token";
import {SerializedEditorState} from "lexical";
import { Editor } from "@/components/blocks/editor-00/editor"
import { lexicalDefaultValue } from '@/lib/lexical-default-state';
import { parseContentToLexicalState } from '@/lib/lexical';

interface TestimonialFormProps {
  testimonial?: {
    id: number
    name: string
    title: string
    company: string
    content: string
    rating: number
    featured: boolean
    active: boolean
  }
}

export default function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [name, setName] = useState(testimonial?.name || "")
  const [title, setTitle] = useState(testimonial?.title || "")
  const [company, setCompany] = useState(testimonial?.company || "")
  const [content, setContent] = useState(testimonial?.content || "")
  const [rating, setRating] = useState(testimonial?.rating || 5)
  const [featured, setFeatured] = useState(testimonial?.featured ?? false)
  const [active, setActive] = useState(testimonial?.active ?? true)

  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()
  const {csrfToken}  = useCsrfToken()
  const [editorState, setEditorState] = useState<SerializedEditorState>(
    parseContentToLexicalState(testimonial?.content)
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
    setError("")
    setSuccess("")

    try {
      const url = testimonial ? `/api/testimonials/${testimonial.id}` : "/api/testimonials"
      const method = testimonial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          title,
          company,
          content,
          rating,
          featured,
          active,
          csrfToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(testimonial ? "Testimonial updated successfully!" : "Testimonial created successfully!")
        setTimeout(() => {
          router.push("/admin/testimonials")
          router.refresh()
        }, 1000)
      } else {
        setError(data.error || "Failed to save testimonial")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {testimonial ? "Edit Testimonial" : "Create New Testimonial"}
        </h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter job title"
            />
          </div>
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Company (Optional)
          </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Testimonial Content *
          </label>
          <Editor
              editorSerializedState={editorState}
              // onSerializedChange={(value) => setEditorState(value)}
              onSerializedChange={(value) => {
                setEditorState(value)
                setContent(JSON.stringify(value))
              }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`w-8 h-8 ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400 transition-colors`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({rating} star{rating !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured testimonial
            </label>
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
                {testimonial ? "Update Testimonial" : "Create Testimonial"}
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
