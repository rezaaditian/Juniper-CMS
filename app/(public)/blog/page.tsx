import Link from "next/link"
import { query } from "@/lib/db"
import { formatDate, parseTags } from "@/lib/utils"
import { searchSchema } from "@/lib/validation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { ArrowRight } from "lucide-react"

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  tags: string
  category: string
  featured_image: string
  published_at: string
}

interface SearchParams {
  q?: string
  page?: string
  category?: string
}

const categoryLabels: Record<string, string> = {
  "research-report": "Research Report",
  "case-study": "Case Study",
  tutorial: "Tutorial",
  "industry-news": "Industry News",
  "best-practices": "Best Practices",
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { q, page, category } = searchSchema.parse({
    q: params.q,
    page: params.page ? Number.parseInt(params.page) : 1,
    category: params.category,
  })

  const limit = 12
  const offset = ((page || 1) - 1) * limit

  let whereClause = "WHERE published = 1"
  const queryParams: any[] = []

  if (q) {
    whereClause += " AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)"
    const searchTerm = `%${q}%`
    queryParams.push(searchTerm, searchTerm, searchTerm)
  }

  if (category) {
    whereClause += " AND category = ?"
    queryParams.push(category)
  }

  // Get posts with error handling
  let posts: Post[] = []
  let totalCount = 0

  try {
    posts = query<Post>(
      `SELECT id, title, slug, excerpt, tags, category, featured_image, published_at 
       FROM posts 
       ${whereClause}
       ORDER BY published_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    )

    const countResult = query<{ count: number }>(`SELECT COUNT(*) as count FROM posts ${whereClause}`, queryParams)
    totalCount = countResult[0]?.count || 0
  } catch (error) {
    console.error("Error fetching posts:", error)
    posts = []
    totalCount = 0
  }

  // Get categories for filter
  const categories = query<{ slug: string; name: string }>("SELECT slug, name FROM categories ORDER BY name ASC")

  const totalPages = Math.ceil(totalCount / limit)
  const currentPage = page || 1

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6">News and Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert insights and strategies to elevate your proposal management success
          </p>
        </header>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          <form method="GET" className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search posts..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              name="category"
              defaultValue={category}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Active filters */}
          {(q || category) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {q && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{q}"
                  <Link href="/blog" className="ml-2 hover:text-blue-600">
                    ×
                  </Link>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Category: {categoryLabels[category] || category}
                  <Link href={`/blog${q ? `?q=${encodeURIComponent(q)}` : ""}`} className="ml-2 hover:text-green-600">
                    ×
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {q || category ? "No posts found matching your criteria." : "No posts published yet."}
              </h3>
              <p className="text-gray-500 mb-6">
                {q || category
                  ? "Try adjusting your search or filters."
                  : "Check back soon for new insights and articles."}
              </p>
              {(q || category) && (
                <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  View all posts
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                        {post.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {categoryLabels[post.category] || post.category}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      {post.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {parseTags(post.tags)
                            .slice(0, 3)
                            .map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                        </div>
                      )}
                      <div className="flex items-center text-blue-600 font-medium">
                        Read more
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/blog?${new URLSearchParams({
                  ...(q && { q }),
                  ...(category && { category }),
                  page: (currentPage - 1).toString(),
                })}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/blog?${new URLSearchParams({
                  ...(q && { q }),
                  ...(category && { category }),
                  page: pageNum.toString(),
                })}`}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  pageNum === currentPage
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={`/blog?${new URLSearchParams({
                  ...(q && { q }),
                  ...(category && { category }),
                  page: (currentPage + 1).toString(),
                })}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
