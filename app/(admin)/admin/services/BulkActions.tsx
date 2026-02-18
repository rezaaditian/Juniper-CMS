"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Service {
  id: number
  title: string
}

interface BulkActionsProps {
  services: Service[]
}

export default function BulkActions({ services }: BulkActionsProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(services.map((service) => service.id))
      // Check all individual checkboxes
      document.querySelectorAll(".service-checkbox").forEach((checkbox) => {
        ;(checkbox as HTMLInputElement).checked = true
      })
    } else {
      setSelectedIds([])
      // Uncheck all individual checkboxes
      document.querySelectorAll(".service-checkbox").forEach((checkbox) => {
        ;(checkbox as HTMLInputElement).checked = false
      })
    }
  }

  // Handle individual checkbox changes
  const handleCheckboxChange = (serviceId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, serviceId])
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== serviceId))
      // Uncheck select all if not all are selected
      const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = false
      }
    }
  }

  // Set up event listeners when component mounts
  useState(() => {
    const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", (e) => {
        handleSelectAll((e.target as HTMLInputElement).checked)
      })
    }

    document.querySelectorAll(".service-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement
        const serviceId = Number.parseInt(target.dataset.id || "0")
        handleCheckboxChange(serviceId, target.checked)
      })
    })
  })

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)

    try {
      const response = await fetch("/api/services/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        router.refresh()
        setSelectedIds([])
        setShowConfirm(false)
      } else {
        alert("Failed to delete services")
      }
    } catch (error) {
      alert("Error deleting services")
    } finally {
      setIsDeleting(false)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-blue-700">
            {selectedIds.length} service{selectedIds.length !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {showConfirm ? (
            <>
              <span className="text-sm text-blue-700">
                Delete {selectedIds.length} service{selectedIds.length !== 1 ? "s" : ""}?
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
