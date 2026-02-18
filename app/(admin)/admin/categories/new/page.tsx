import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import CategoryForm from "../CategoryForm"

export const runtime = "nodejs"

export default async function NewCategoryPage() {
  const session = await getSession()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Category</h1>
        <p className="text-gray-600">Add a new category for blog posts</p>
      </div>

      <CategoryForm />
    </div>
  )
}
