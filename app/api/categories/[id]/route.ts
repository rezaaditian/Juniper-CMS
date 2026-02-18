import { type NextRequest, NextResponse } from "next/server"
import { handleGet, handleUpdate } from "@/lib/crud"
import { categoryConfig } from "@/lib/crud-configs"
import { requireAuth } from "@/lib/auth-server"
import { run, get } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return handleGet(request, categoryConfig, params.id)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(request, categoryConfig, params.id)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    // Check if category exists
    const existingCategory = await get("SELECT id FROM categories WHERE id = ?", [params.id])
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const postsUsingCategory = await get(
      "SELECT id FROM posts WHERE category = (SELECT slug FROM categories WHERE id = ?)",
      [params.id],
    )
    if (postsUsingCategory.length > 0) {
      return NextResponse.json({ error: "Cannot delete category that is being used by posts" }, { status: 400 })
    }

    await run("DELETE FROM categories WHERE id = ?", [params.id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
