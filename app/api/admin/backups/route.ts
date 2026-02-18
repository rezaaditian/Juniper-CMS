import { type NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: authResult.error }, { status: 401 })
    // }
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const backupDir = path.join(process.cwd(), "data", "backups")

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
      return NextResponse.json([])
    }

    const files = fs.readdirSync(backupDir)
    const backups = files
      .filter((file) => file.endsWith(".db"))
      .map((file) => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        return {
          id: file,
          name: file,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
        }
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

    return NextResponse.json(backups)
  } catch (error: any) {
    console.error("List backups error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: authResult.error }, { status: 401 })
    // }
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const dbPath = path.join(process.cwd(), "data", "app.db")
    const backupDir = path.join(process.cwd(), "data", "backups")

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, -5)
    const backupPath = path.join(backupDir, `app-${timestamp}.db`)

    // Check if source database exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Source database not found" }, { status: 404 })
    }

    // Copy database file
    fs.copyFileSync(dbPath, backupPath)

    // Get backup info
    const stats = fs.statSync(backupPath)
    const backup = {
      id: `app-${timestamp}.db`,
      name: `app-${timestamp}.db`,
      size: stats.size,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
    }

    return NextResponse.json({ success: true, backup })
  } catch (error: any) {
    console.error("Create backup error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
