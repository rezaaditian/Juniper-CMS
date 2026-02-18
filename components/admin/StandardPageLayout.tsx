"use client"

import type { ReactNode } from "react"
import Link from "next/link"

interface StandardPageLayoutProps {
  title: string
  description: string
  createHref?: string
  createLabel?: string
  children: ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function StandardPageLayout({
  title,
  description,
  createHref,
  createLabel = "New Item",
  children,
  loading = false,
  error = null,
  onRetry,
}: StandardPageLayoutProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 text-red-600 hover:text-red-800 underline">
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        {createHref && (
          <Link
            href={createHref}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {createLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
