import { type NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-server";
import fs from "fs";
import path from "path";

interface ImageFile {
  name: string;
  originalName: string;
  size: number;
  created: string;
  path: string;
  url: string;
  type: string;
}
const ROOT_DIR = path.join(process.cwd(), "upload-image", "uploads", "images")
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
}
function scanDirectory(dir: string, relativePath = ""): ImageFile[] {
  const results: ImageFile[] = []

  const items = fs.readdirSync(dir)
  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stats = fs.statSync(itemPath)

    if (stats.isDirectory()) {
      results.push(...scanDirectory(itemPath, path.join(relativePath, item)))
    } else if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
      const ext = path.extname(item).toLowerCase()
      results.push({
        name: item,
        originalName: item,
        size: stats.size,
        created: stats.mtime.toISOString(),
        path: relativePath,
        url: `/api/files/uploads/images/${path
            .join(relativePath, item)
            .replace(/\\/g, "/")}`,
        type: MIME_TYPES[ext] || "application/octet-stream",
      })
    }
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI(request)
    if (authResult instanceof NextResponse) return authResult

    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR, { recursive: true })
    }

    let images = scanDirectory(ROOT_DIR);

    images = images.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("List images error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI(request)
    if (authResult instanceof NextResponse) return authResult;

    const { imagePath } = await request.json()

    if (!imagePath) {
      return NextResponse.json(
        { error: "Image path is required" },
        { status: 400 }
      );
    }

    if (!imagePath.startsWith("/api/files/uploads/images/")) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 })
    }

    const relativePath = imagePath.replace("/api/files/", "")
    const fullPath = path.join(process.cwd(), "upload-image", relativePath);

    if (!fullPath.startsWith(ROOT_DIR)) {
      return NextResponse.json({ error: "Invalid path traversal" }, { status: 400 })
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    fs.unlinkSync(fullPath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}