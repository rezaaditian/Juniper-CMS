import { type NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-server"
import fs from "fs"
import path from "path"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuthAPI(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: authResult.error }, { status: 401 })
    // }
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const backupDir = path.join(process.cwd(), "data", "backups")
    const backupPath = path.join(backupDir, params.id)

    // Security check - ensure the file is in the backup directory and has .db extension
    if (!params.id.endsWith(".db") || params.id.includes("..") || params.id.includes("/")) {
      return NextResponse.json({ error: "Invalid backup file name" }, { status: 400 })
    }

    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    fs.unlinkSync(backupPath)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete backup error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuthAPI(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: authResult.error }, { status: 401 })
    // }
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const backupDir = path.join(process.cwd(), "data", "backups")
    const backupPath = path.join(backupDir, params.id)

    // Security check
    if (!params.id.endsWith(".db") || params.id.includes("..") || params.id.includes("/")) {
      return NextResponse.json({ error: "Invalid backup file name" }, { status: 400 })
    }

    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    // Return file for download
    const fileBuffer = fs.readFileSync(backupPath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${params.id}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("Download backup error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
