import { type NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: authResult.error }, { status: 401 })
    // }
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const body = await request.json()
    const { backupId } = body

    if (!backupId) {
      return NextResponse.json({ error: "Backup ID is required" }, { status: 400 })
    }

    // Security check
    if (!backupId.endsWith(".db") || backupId.includes("..") || backupId.includes("/")) {
      return NextResponse.json({ error: "Invalid backup file name" }, { status: 400 })
    }

    const backupDir = path.join(process.cwd(), "data", "backups")
    const backupPath = path.join(backupDir, backupId)
    const dbPath = path.join(process.cwd(), "data", "app.db")

    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    // Create a backup of current database before restoring
    const currentBackupTimestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, -5)
    const currentBackupPath = path.join(backupDir, `app-pre-restore-${currentBackupTimestamp}.db`)

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, currentBackupPath)
    }

    // Restore from backup
    fs.copyFileSync(backupPath, dbPath)

    return NextResponse.json({
      success: true,
      message: "Database restored successfully",
      currentBackup: `app-pre-restore-${currentBackupTimestamp}.db`,
    })
  } catch (error: any) {
    console.error("Restore backup error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
