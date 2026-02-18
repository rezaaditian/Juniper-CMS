import { notFound } from "next/navigation";
import Link from "next/link";
import { get } from "@/lib/db";
import { formatDate, parseTags } from "@/lib/utils";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { verifySessionEdge } from "@/lib/auth-edge";
import { LexicalContent } from '@/components/editor/utils/convert-lexical-html';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  published: number;
  published_at: string;
  updated_at: string;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || null;
  let query = "SELECT * FROM posts WHERE slug = ? AND published = 1";
  let isPreview = false;
  if (token) {
    const session = await verifySessionEdge(token);
    if (session) {
      query = "SELECT * FROM posts WHERE slug = ?";
    }
  }

  const post = get<Post>(query, [slug]);

  if (!post) {
    notFound();
  }
  if (post.published === 0) {
    isPreview = true;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {isPreview && (
        <div className="py-2 text-center text-yellow-800 bg-yellow-100 border-b border-yellow-300">
          Preview Mode
        </div>
      )}
      <div className="max-w-4xl px-4 py-16 mx-auto">
        {/* Back to Blog */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Insights
          </Link>
        </div>

        {/* Post Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6 text-sm text-gray-500">
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
            {post.tags && (
              <>
                <span className="mx-3">•</span>
                <div className="flex gap-2">
                  {parseTags(post.tags).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <h1 className="mb-6 text-4xl font-light leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-600">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Post Content */}
        <article className="prose prose-lg max-w-none">
          <LexicalContent content={post.content} />
        </article>

        {/* Footer Navigation */}
        <footer className="pt-8 mt-16 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Insights
            </Link>
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(post.updated_at)}
            </div>
          </div>
        </footer>
      </div>

      <Footer />
    </div>
  );
}
