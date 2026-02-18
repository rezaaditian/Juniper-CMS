"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        window.location.href = "/admin/login"
      } else {
        console.error("Logout failed")
        // Fallback: still redirect to login
        router.push("/admin/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback: still redirect to login
      router.push("/admin/login")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Logging out...
        </span>
      ) : (
        "Logout"
      )}
    </button>
  )
}
