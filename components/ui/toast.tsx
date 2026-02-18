"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "default" | "success" | "error" | "warning"
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = "default", duration = 5000, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const typeStyles = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
  }

  const iconStyles = {
    default: "text-gray-400",
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
  }

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        typeStyles[type],
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === "success" && (
              <svg className={cn("h-5 w-5", iconStyles[type])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === "error" && (
              <svg className={cn("h-5 w-5", iconStyles[type])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {type === "warning" && (
              <svg className={cn("h-5 w-5", iconStyles[type])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            )}
            {type === "default" && (
              <svg className={cn("h-5 w-5", iconStyles[type])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && <p className="text-sm font-medium text-gray-900">{title}</p>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-0 right-0 z-50 p-6 space-y-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
