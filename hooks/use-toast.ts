"use client"

import { useState, useCallback } from "react"

export interface ToastData {
  id: string
  title?: string
  description?: string
  type?: "default" | "success" | "error" | "warning"
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (options: Omit<ToastData, "id">) => {
      addToast(options)
    },
    [addToast],
  )

  return {
    toasts,
    toast,
    removeToast,
  }
}
