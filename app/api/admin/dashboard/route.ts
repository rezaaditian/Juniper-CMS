import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuthAPI } from "@/lib/auth-server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Get database stats
    const postsRow = await query<{ count: number }>("SELECT COUNT(*) as count FROM posts")
    const servicesRow = await query<{ count: number }>("SELECT COUNT(*) as count FROM services")
    const testimonialsRow = await query<{ count: number }>("SELECT COUNT(*) as count FROM testimonials")
    const categoriesRow = await query<{ count: number }>("SELECT COUNT(*) as count FROM categories")

    const postsCount = postsRow[0]?.count || 0
    const servicesCount = servicesRow[0]?.count || 0
    const testimonialsCount = testimonialsRow[0]?.count || 0
    const categoriesCount = categoriesRow[0]?.count || 0

    // Get file system stats
    let uploadsSize = 0
    let backupsCount = 0

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir)
        for (const file of files) {
          const filePath = path.join(uploadsDir, file.toString())
          if (fs.statSync(filePath).isFile()) {
            uploadsSize += fs.statSync(filePath).size
          }
        }
      }

      const backupsDir = path.join(process.cwd(), "data", "backups")
      if (fs.existsSync(backupsDir)) {
        const backupFiles = fs.readdirSync(backupsDir).filter((f) => f.endsWith(".zip"))
        backupsCount = backupFiles.length
      }
    } catch (error) {
      console.error("Error reading file system stats:", error)
    }

    const stats = {
      posts: postsCount,
      services: servicesCount,
      testimonials: testimonialsCount,
      categories: categoriesCount,
      uploadsSize: Math.round((uploadsSize / 1024 / 1024) * 100) / 100, // MB
      backupsCount,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
