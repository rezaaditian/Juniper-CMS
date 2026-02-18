import type { NextRequest } from "next/server"
import { handleGet, handleUpdate, handleDelete } from "@/lib/crud"
import { postConfig } from "@/lib/crud-configs"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleGet(request, postConfig, id)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(request, postConfig, id)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleDelete(request, postConfig, id)
}
