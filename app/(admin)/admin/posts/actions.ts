"use server"

import { query } from "@/lib/db"
import { redirect } from "next/navigation"

export const runtime = "nodejs"

export async function deletePost(formData: FormData) {
  const id = formData.get("id") as string

  try {
    await query("DELETE FROM posts WHERE id = ?", [id])
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }

  redirect("/admin/posts")
}
