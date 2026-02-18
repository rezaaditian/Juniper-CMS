"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SettingsForm from "./SettingsForm"

interface ContactInfo {
  id: number
  key: string
  value: string
  label: string
  type: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, { value: string; label: string; type: string }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/settings", {
        credentials: "include",
      })

      if (response.status === 401) {
        router.push("/admin/login")
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const contactInfo = Array.isArray(data) ? data : data.items || []

      const settingsData = contactInfo.reduce(
        (acc: Record<string, { value: string; label: string; type: string }>, item: ContactInfo) => {
          acc[item.key] = {
            value: item.value,
            label: item.label || item.key,
            type: item.type || "text",
          }
          return acc
        },
        {},
      )

      setSettings(settingsData)
    } catch (err) {
      console.error("Settings fetch error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
          <button onClick={fetchSettings} className="mt-2 text-red-600 hover:text-red-800 underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your website settings and contact information</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
