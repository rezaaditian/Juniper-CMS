import type { NextRequest } from "next/server"
import { handleBulkUpdate } from "@/lib/crud"
import { serviceConfig } from "@/lib/crud-configs"

export async function PUT(request: NextRequest) {
  return handleBulkUpdate(request, serviceConfig)
}
