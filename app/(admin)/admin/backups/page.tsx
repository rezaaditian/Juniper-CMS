"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Backup {
  id: string
  name: string
  size: number
  created: string
  modified: string
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/admin/backups", {
        credentials: "include",
      })

      if (response.status === 401) {
        router.push("/admin/login")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch backups")
      }

      const data = await response.json()
      setBackups(data)
    } catch (err) {
      console.error("Fetch backups error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    setCreating(true)
    try {
      const response = await fetch("/api/admin/backups", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to create backup")
      }

      const result = await response.json()
      if (result.success) {
        await fetchBackups()
        alert("Backup created successfully!")
      }
    } catch (err) {
      console.error("Create backup error:", err)
      alert("Failed to create backup")
    } finally {
      setCreating(false)
    }
  }

  const deleteBackup = async (backupId: string) => {
    if (!confirm("Are you sure you want to delete this backup? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/backups/${backupId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete backup")
      }

      setBackups(backups.filter((backup) => backup.id !== backupId))
      alert("Backup deleted successfully!")
    } catch (err) {
      console.error("Delete backup error:", err)
      alert("Failed to delete backup")
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (
      !confirm(
        "Are you sure you want to restore from this backup? This will replace your current database. A backup of the current state will be created automatically.",
      )
    ) {
      return
    }

    setRestoring(backupId)
    try {
      const response = await fetch("/api/admin/backups/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ backupId }),
      })

      if (!response.ok) {
        throw new Error("Failed to restore backup")
      }

      const result = await response.json()
      if (result.success) {
        await fetchBackups()
        alert(`Database restored successfully! A backup of the previous state was saved as: ${result.currentBackup}`)
        // Refresh the page to reflect changes
        window.location.reload()
      }
    } catch (err) {
      console.error("Restore backup error:", err)
      alert("Failed to restore backup")
    } finally {
      setRestoring(null)
    }
  }

  const downloadBackup = (backupId: string) => {
    const link = document.createElement("a")
    link.href = `/api/admin/backups/${backupId}`
    link.download = backupId
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Backups</h1>
          <p className="text-gray-600">Manage your database backups and restore points</p>
        </div>
        <button
          onClick={createBackup}
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center disabled:opacity-50"
        >
          {creating ? (
            <>
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Backup
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {backups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No backups yet</h3>
          <p className="text-gray-500 mb-6">Create your first database backup to get started.</p>
          <button
            onClick={createBackup}
            disabled={creating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center disabled:opacity-50"
          >
            {creating ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Backup
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                      <div className="text-sm text-gray-500">ID: {backup.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatFileSize(backup.size)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(backup.created)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => downloadBackup(backup.id)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          title="Download Backup"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          disabled={restoring === backup.id}
                          className="text-green-600 hover:text-green-900 inline-flex items-center disabled:opacity-50"
                          title="Restore from Backup"
                        >
                          {restoring === backup.id ? (
                            <>
                              <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Restoring...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Restore
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          title="Delete Backup"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>Total backups: {backups.length}</div>
              <div>Total size: {formatFileSize(backups.reduce((sum, backup) => sum + backup.size, 0))}</div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Restoring a backup will replace your current database completely</li>
                <li>A backup of your current state is automatically created before restoration</li>
                <li>Download backups regularly to keep them safe from server issues</li>
                <li>Backups include all posts, services, testimonials, categories, and settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
