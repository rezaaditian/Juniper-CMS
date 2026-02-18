"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDate, parseTags } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  tags: string
  published: number
  created_at: string
  updated_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts?simple=true", {
        credentials: "include",
      })

      if (response.status === 401) {
        router.push("/admin/login")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setPosts(data)
      } else {
        setPosts([])
        setError("Invalid response format from server")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
        toast({
          type: "success",
          title: "Success",
          description: "Post deleted successfully",
        })
      } else {
        const data = await response.json()
        toast({
          type: "error",
          title: "Error",
          description: data.error || "Failed to delete post",
        })
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Error",
        description: "Network error occurred",
      })
    }
  }

  const handleSelectPost = (postId: number) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map((post) => post.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedPosts.size} selected posts?`)) {
      return
    }

    setBulkLoading(true)
    try {
      const response = await fetch("/api/posts/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ids: Array.from(selectedPosts) }),
      })

      if (response.ok) {
        setPosts(posts.filter((post) => !selectedPosts.has(post.id)))
        setSelectedPosts(new Set())
        toast({
          type: "success",
          title: "Success",
          description: `${selectedPosts.size} posts deleted successfully`,
        })
      } else {
        const data = await response.json()
        toast({
          type: "error",
          title: "Error",
          description: data.error || "Failed to delete posts",
        })
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Error",
        description: "Network error occurred",
      })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkPublish = async (published: boolean) => {
    if (selectedPosts.size === 0) return

    setBulkLoading(true)
    try {
      const response = await fetch("/api/posts/bulk-update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ids: Array.from(selectedPosts),
          updates: { published: published ? 1 : 0 },
        }),
      })

      if (response.ok) {
        setPosts(posts.map((post) => (selectedPosts.has(post.id) ? { ...post, published: published ? 1 : 0 } : post)))
        setSelectedPosts(new Set())
        toast({
          type: "success",
          title: "Success",
          description: `${selectedPosts.size} posts ${published ? "published" : "unpublished"} successfully`,
        })
      } else {
        const data = await response.json()
        toast({
          type: "error",
          title: "Error",
          description: data.error || "Failed to update posts",
        })
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Error",
        description: "Network error occurred",
      })
    } finally {
      setBulkLoading(false)
    }
  }

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button onClick={fetchPosts} className="mt-2 text-sm text-red-600 hover:text-red-500 underline">
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600">Manage your blog posts ({posts.length} total)</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedPosts.size} post{selectedPosts.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkPublish(true)}
                  disabled={bulkLoading}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? "Publishing..." : "Publish"}
                </button>
                <button
                  onClick={() => handleBulkPublish(false)}
                  disabled={bulkLoading}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? "Unpublishing..." : "Unpublish"}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first blog post.</p>
            <Link
              href="/admin/posts/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPosts.size === posts.length && posts.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPosts.has(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                          {post.excerpt && <div className="text-sm text-gray-500 truncate mt-1">{post.excerpt}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {post.tags ? (
                            parseTags(post.tags)
                              .slice(0, 3)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))
                          ) : (
                            <span className="text-xs text-gray-400">No tags</span>
                          )}
                          {post.tags && parseTags(post.tags).length > 3 && (
                            <span className="text-xs text-gray-500">+{parseTags(post.tags).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                            title="View Post"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </Link>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                            title="Delete Post"
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
                <div>
                  {posts.filter((p) => p.published).length} published, {posts.filter((p) => !p.published).length} drafts
                </div>
                <div>Total: {posts.length} posts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
