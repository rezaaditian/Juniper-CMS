"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {useCsrfToken} from "@/hooks/use-csrf-token";
import {useToast} from "@/hooks/use-toast";

interface SettingsFormProps {
  settings: Record<string, { value: string; label: string; type: string }>
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState(
    Object.keys(settings).reduce(
      (acc, key) => {
        acc[key] = settings[key].value
        return acc
      },
      {} as Record<string, string>,
    ),
  )
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()
  const {csrfToken}  = useCsrfToken()

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csrfToken) {
      toast({
        type: "error",
        title: "Security Error",
        description: "Security token not available. Please refresh the page and try again.",
      })
      return
    }
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Settings updated successfully!")
        router.refresh()
      } else {
        setError(data.error || "Failed to update settings")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const settingsGroups = [
    {
      title: "Contact Information",
      keys: ["email", "phone", "location"],
    },
    {
      title: "Homepage Content",
      keys: ["hero_title", "hero_subtitle"],
    },
    {
      title: "Contact Section",
      keys: ["contact_title", "contact_description"],
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Website Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
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

        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">{group.title}</h3>
            <div className="grid grid-cols-1 gap-6">
              {group.keys.map((key) => {
                const setting = settings[key]
                if (!setting) return null

                return (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.label}
                    </label>
                    {setting.type === "textarea" ? (
                      <textarea
                        id={key}
                        value={formData[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type={setting.type}
                        id={key}
                        value={formData[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

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
                Update Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
