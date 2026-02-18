import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import PostForm from "../PostForm"

export const runtime = "nodejs"

export default async function NewPostPage() {
  // Check authentication
  const session = await getSession()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600">Write and publish a new blog post</p>
      </div>

      <PostForm />
    </div>
  )
}
