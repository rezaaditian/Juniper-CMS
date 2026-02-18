import Link from "next/link"

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  featured_image: string
  published_at: string
}

interface BlogGridProps {
  posts: Post[]
}

const categoryColors: Record<string, string> = {
  "research-report": "bg-slate-800/90 text-white",
  "case-study": "bg-slate-800/90 text-white",
  tutorial: "bg-slate-800/90 text-white",
  "industry-news": "bg-slate-800/90 text-white",
  "best-practices": "bg-slate-800/90 text-white",
  default: "bg-slate-800/90 text-white",
}

const categoryLabels: Record<string, string> = {
  "research-report": "RESEARCH REPORT",
  "case-study": "CASE STUDY",
  tutorial: "TUTORIAL",
  "industry-news": "INDUSTRY NEWS",
  "best-practices": "BEST PRACTICES",
}

export default function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {posts.map((post) => {
        const categoryClass = categoryColors[post.category] || categoryColors.default
        const categoryLabel = categoryLabels[post.category] || post.category?.toUpperCase() || "ARTICLE"

        return (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <article className="relative overflow-hidden hover:opacity-90 transition-opacity duration-300 aspect-[4/5]">
              <div className="absolute inset-0">
                {post.featured_image ? (
                  <img
                    src={post.featured_image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                    <div className="text-white/20 text-8xl font-bold">{categoryLabel.charAt(0)}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
              </div>

              <div className="relative h-full flex flex-col justify-between p-4 text-white">
                <div className="flex justify-start">
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider ${categoryClass}`}
                  >
                    {categoryLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-white text-lg leading-tight line-clamp-4">{post.title}</h3>
                </div>
              </div>
            </article>
          </Link>
        )
      })}
    </div>
  )
}
