import type { NextRequest } from "next/server"
import { handleGet, handleUpdate, handleDelete } from "@/lib/crud"
import { testimonialConfig } from "@/lib/crud-configs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return handleGet(request, testimonialConfig, params.id)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(request, testimonialConfig, params.id)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return handleDelete(request, testimonialConfig, params.id)
}
