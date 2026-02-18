import { type NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-server"
import { query } from "@/lib/db"

export const runtime = "nodejs"

interface Stats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalBackups: number
  lastBackup: string | null
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const [total, published, drafts] = await Promise.all([
      query<{ count: number }>("SELECT COUNT(*) as count FROM posts"),
      query<{ count: number }>("SELECT COUNT(*) as count FROM posts WHERE published = 1"),
      query<{ count: number }>("SELECT COUNT(*) as count FROM posts WHERE published = 0"),
    ])

    // Get backup info
    let totalBackups = 0
    let lastBackup: string | null = null

    try {
      const fs = require("fs")
      const path = require("path")
      const backupDir = path.join(process.cwd(), "data", "backups")

      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir).filter((file: string) => file.endsWith(".db"))
        totalBackups = files.length

        if (files.length > 0) {
          const backupFiles = files
            .map((file: string) => {
              const filePath = path.join(backupDir, file)
              const stats = fs.statSync(filePath)
              return { file, created: stats.birthtime }
            })
            .sort((a: any, b: any) => b.created.getTime() - a.created.getTime())

          lastBackup = backupFiles[0].created.toISOString()
        }
      }
    } catch (backupError) {
      console.error("Error reading backup directory:", backupError)
    }

    const stats: Stats = {
      totalPosts: total[0]?.count || 0,
      publishedPosts: published[0]?.count || 0,
      draftPosts: drafts[0]?.count || 0,
      totalBackups,
      lastBackup,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error getting stats:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
