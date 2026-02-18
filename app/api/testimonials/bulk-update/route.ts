import type { NextRequest } from "next/server"
import { handleBulkUpdate } from "@/lib/crud"
import { testimonialConfig } from "@/lib/crud-configs"

export async function PUT(request: NextRequest) {
  return handleBulkUpdate(request, testimonialConfig)
}
