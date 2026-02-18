"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DeleteButtonProps {
  serviceId: number
  serviceTitle: string
}

export default function DeleteButton({ serviceId, serviceTitle }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
        setShowConfirm(false)
      } else {
        alert("Failed to delete service")
      }
    } catch (error) {
      alert("Error deleting service")
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="inline-flex items-center space-x-2">
        <span className="text-sm text-gray-600">Delete "{serviceTitle}"?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          {isDeleting ? "Deleting..." : "Yes"}
        </button>
        <button onClick={() => setShowConfirm(false)} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          No
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setShowConfirm(true)} className="text-red-600 hover:text-red-900">
      Delete
    </button>
  )
}
