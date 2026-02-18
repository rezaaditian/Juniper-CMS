import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-server"
import { run, query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const contactInfo = query<{ key: string; value: string; label: string; type: string }>(
      "SELECT key, value, label, type FROM contact_info ORDER BY key ASC",
    )

    // Convert to key-value pairs for easier handling
    const settings = contactInfo.reduce(
      (acc, item) => {
        acc[item.key] = {
          value: item.value,
          label: item.label,
          type: item.type,
        }
        return acc
      },
      {} as Record<string, { value: string; label: string; type: string }>,
    )

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      run(
        `UPDATE contact_info 
         SET value = ?, updated_at = datetime('now')
         WHERE key = ?`,
        [value as string, key],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update settings error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
