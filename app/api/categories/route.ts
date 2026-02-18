import type { NextRequest } from "next/server"
import { handleList, handleCreate } from "@/lib/crud"
import { categoryConfig } from "@/lib/crud-configs"

export async function GET(request: NextRequest) {
  return handleList(request, categoryConfig)
}

export async function POST(request: NextRequest) {
  return handleCreate(request, categoryConfig)
}
