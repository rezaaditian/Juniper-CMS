"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface ImageFile {
  name: string
  originalName: string
  size: number
  created: string
  path: string
  url: string
  type: string
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/images", {
        credentials: "include",
      })

      if (response.status === 401) {
        router.push("/admin/login")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }

      const data = await response.json()
      setImages(data.images || [])
    } catch (err) {
      console.error("Fetch images error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Upload failed")
        }

        return response.json()
      })

      await Promise.all(uploadPromises)
      await fetchImages()

      // Clear file input
      e.target.value = ""
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageUrl)) {
      newSelected.delete(imageUrl)
    } else {
      newSelected.add(imageUrl)
    }
    setSelectedImages(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(images.map((img) => img.url)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) return

    if (
      !confirm(
        `Are you sure you want to delete ${selectedImages.size} selected image(s)? This action cannot be undone.`,
      )
    ) {
      return
    }

    try {
      const deletePromises = Array.from(selectedImages).map(async (imagePath) => {
        const response = await fetch("/api/admin/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ imagePath }),
        })

        if (!response.ok) {
          throw new Error(`Failed to delete ${imagePath}`)
        }
      })

      await Promise.all(deletePromises)
      setSelectedImages(new Set())
      await fetchImages()
      alert("Selected images deleted successfully!")
    } catch (error) {
      console.error("Delete images error:", error)
      alert("Failed to delete some images")
    }
  }

  const copyImageUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    alert("Image URL copied to clipboard!")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const groupImagesByMonth = (images: ImageFile[]) => {
    const groups: Record<string, ImageFile[]> = {}

    if (!images || !Array.isArray(images)) {
      return groups
    }

    images.forEach((image) => {
      const date = new Date(image.created)
      const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })

      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(image)
    })

    return groups
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const imageGroups = groupImagesByMonth(images || [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Library</h1>
          <p className="text-gray-600">Manage your uploaded images ({images.length} total)</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedImages.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Selected ({selectedImages.size})
            </button>
          )}
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center cursor-pointer">
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Images
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <button onClick={handleSelectAll} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {selectedImages.size === images.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-gray-500">
              {selectedImages.size} of {images.length} selected
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Total size: {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-500 mb-6">Upload your first images to get started.</p>
          <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Your First Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(imageGroups).map(([monthYear, monthImages]) => (
            <div key={monthYear}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{monthYear}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {monthImages.map((image) => (
                  <div
                    key={image.url}
                    className={`relative group bg-white rounded-lg shadow overflow-hidden ${
                      selectedImages.has(image.url) ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="aspect-square">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Selection checkbox */}
                    <div className="absolute z-10 top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.url)}
                        onChange={() => handleImageSelect(image.url)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyImageUrl(image.url)}
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="Copy URL"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 00-2-2V6a2 2 0 002-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="View Full Size"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Image info */}
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-900 truncate" title={image.originalName}>
                        {image.originalName}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{formatFileSize(image.size)}</span>
                        <span className="text-xs text-gray-500">{formatDate(image.created)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
