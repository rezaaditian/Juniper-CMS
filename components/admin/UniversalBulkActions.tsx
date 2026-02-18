"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface BulkActionsConfig {
  entityName: string
  entityNamePlural: string
  checkboxClass: string
  bulkDeleteEndpoint: string
  bulkUpdateEndpoint?: string
}

interface UniversalBulkActionsProps<T extends { id: number }> {
  items: T[]
  config: BulkActionsConfig
  onSelectionChange?: (selectedIds: number[]) => void
}

export default function UniversalBulkActions<T extends { id: number }>({
  items,
  config,
  onSelectionChange,
}: UniversalBulkActionsProps<T>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = items.map((item) => item.id)
      setSelectedIds(allIds)
      // Check all individual checkboxes
      document.querySelectorAll(`.${config.checkboxClass}`).forEach((checkbox) => {
        ;(checkbox as HTMLInputElement).checked = true
      })
    } else {
      setSelectedIds([])
      // Uncheck all individual checkboxes
      document.querySelectorAll(`.${config.checkboxClass}`).forEach((checkbox) => {
        ;(checkbox as HTMLInputElement).checked = false
      })
    }
  }

  // Handle individual checkbox changes
  const handleCheckboxChange = (itemId: number, checked: boolean) => {
    let newSelectedIds: number[]

    if (checked) {
      newSelectedIds = [...selectedIds, itemId]
    } else {
      newSelectedIds = selectedIds.filter((id) => id !== itemId)
      // Uncheck select all if not all are selected
      const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = false
      }
    }

    setSelectedIds(newSelectedIds)
    onSelectionChange?.(newSelectedIds)
  }

  // Set up event listeners
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement
    const handleSelectAllChange = (e: Event) => {
      handleSelectAll((e.target as HTMLInputElement).checked)
    }

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", handleSelectAllChange)
    }

    const handleCheckboxChangeEvent = (e: Event) => {
      const target = e.target as HTMLInputElement
      const itemId = Number.parseInt(target.dataset.id || "0")
      handleCheckboxChange(itemId, target.checked)
    }

    document.querySelectorAll(`.${config.checkboxClass}`).forEach((checkbox) => {
      checkbox.addEventListener("change", handleCheckboxChangeEvent)
    })

    // Cleanup
    return () => {
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", handleSelectAllChange)
      }
      document.querySelectorAll(`.${config.checkboxClass}`).forEach((checkbox) => {
        checkbox.removeEventListener("change", handleCheckboxChangeEvent)
      })
    }
  }, [items, config.checkboxClass])

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedIds)
  }, [selectedIds, onSelectionChange])

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)

    try {
      const response = await fetch(config.bulkDeleteEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        window.location.reload()
        setSelectedIds([])
        setShowConfirm(false)
      } else {
        const data = await response.json()
        alert(`Failed to delete ${config.entityNamePlural}: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      alert(`Error deleting ${config.entityNamePlural}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkUpdate = async (updates: Record<string, any>) => {
    if (selectedIds.length === 0 || !config.bulkUpdateEndpoint) return

    setIsUpdating(true)

    try {
      const response = await fetch(config.bulkUpdateEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds, updates }),
      })

      if (response.ok) {
        window.location.reload()
        setSelectedIds([])
      } else {
        const data = await response.json()
        alert(`Failed to update ${config.entityNamePlural}: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      alert(`Error updating ${config.entityNamePlural}`)
    } finally {
      setIsUpdating(false)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-blue-700">
            {selectedIds.length} {selectedIds.length === 1 ? config.entityName : config.entityNamePlural} selected
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Bulk status update buttons for applicable entities */}
          {config.bulkUpdateEndpoint && (
            <>
              <button
                onClick={() => handleBulkUpdate({ active: 1 })}
                disabled={isUpdating}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Activate"}
              </button>
              <button
                onClick={() => handleBulkUpdate({ active: 0 })}
                disabled={isUpdating}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Deactivate"}
              </button>
            </>
          )}

          {showConfirm ? (
            <>
              <span className="text-sm text-blue-700">
                Delete {selectedIds.length} {selectedIds.length === 1 ? config.entityName : config.entityNamePlural}?
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
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
