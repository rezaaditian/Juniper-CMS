"use server"

import { query } from "@/lib/db"
import { redirect } from "next/navigation"

export const runtime = "nodejs"

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id") as string

  try {
    await query("DELETE FROM categories WHERE id = ?", [id])
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }

  redirect("/admin/categories")
}
