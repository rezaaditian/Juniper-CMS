import type { NextRequest } from "next/server"
import { handleBulkDelete } from "@/lib/crud"
import { serviceConfig } from "@/lib/crud-configs"

export async function DELETE(request: NextRequest) {
  return handleBulkDelete(request, serviceConfig)
}
