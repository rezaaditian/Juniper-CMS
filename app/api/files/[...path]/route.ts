import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> }
    // { params }: { params: { path: string[] } }
) {
    try {
        const { path: pathSegments } = await context.params
        const filePath = path.resolve(process.cwd(), "upload-image", ...pathSegments)

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        const fileBuffer = fs.readFileSync(filePath)

        const ext = path.extname(filePath).toLowerCase()
        const mime =
            ext === ".jpg" || ext === ".jpeg"
                ? "image/jpeg"
                : ext === ".png"
                    ? "image/png"
                    : ext === ".webp"
                        ? "image/webp"
                        : ext === ".gif"
                            ? "image/gif"
                            : "application/octet-stream"

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": mime,
                "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
            },
        })
    } catch (err) {
        console.error("File serve error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
