import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import { get } from "@/lib/db"
import CategoryForm from "../../CategoryForm"

export const runtime = "nodejs"

interface Category {
  id: number
  name: string
  slug: string
  color: string
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()
  if (!session) {
    redirect("/admin/login")
  }

  const { id } = params
  const category = await get<Category>("SELECT * FROM categories WHERE id = ?", [id])

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600">Update category information</p>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}
