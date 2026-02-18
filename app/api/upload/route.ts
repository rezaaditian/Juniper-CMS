import { type NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-server";
import { rateLimit } from "@/lib/rate-limit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const FILE_SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signature) return false;

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 100); // Limit filename length
}

export async function POST(request: NextRequest) {
  try {
    // const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    function getClientIp(req: NextRequest): string {
      const forwardedFor = req.headers.get("x-forwarded-for");
      if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
      }
      return req.headers.get("x-real-ip") || "unknown";
    }
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`upload-${ip}`, 10, 60 * 1000); // 10 uploads per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Upload rate limit exceeded. Try again in ${Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          )} seconds.`,
        },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 100; // 100 bytes minimum
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }
    if (file.size < minSize) {
      return NextResponse.json(
        { error: "File too small. Minimum size is 100 bytes." },
        { status: 400 }
      );
    }

    if (!file.name || file.name.length > 255) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const sanitizedOriginalName = sanitizeFilename(file.name);

    const uploadsDir = path.resolve(
      process.cwd(),
      "upload-image",
      "uploads",
      "images"
    );
    const yearMonth = new Date()
      .toISOString()
      .slice(0, 7)
      .replace(/[^0-9-]/g, ""); // Extra sanitization
    const monthDir = path.resolve(uploadsDir, yearMonth);

    // Ensure the resolved path is within the uploads directory
    if (!monthDir.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: "Invalid upload path" },
        { status: 400 }
      );
    }

    // Ensure directory exists with secure permissions
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true, mode: 0o755 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: "File content doesn't match declared type" },
        { status: 400 }
      );
    }

    const fileExtension = path.extname(sanitizedOriginalName).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 }
      );
    }

    let uniqueFilename: string;
    let filePath: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique filename with collision detection
    do {
      const timestamp = Date.now();
      const randomBytes = crypto.randomBytes(8).toString("hex");
      uniqueFilename = `${timestamp}_${randomBytes}${fileExtension}`;
      filePath = path.resolve(monthDir, uniqueFilename);
      attempts++;
    } while (fs.existsSync(filePath) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Unable to generate unique filename" },
        { status: 500 }
      );
    }

    // Final path validation
    if (!filePath.startsWith(monthDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const tempFilePath = `${filePath}.tmp`;
    try {
      fs.writeFileSync(tempFilePath, buffer, { mode: 0o644 });
      fs.renameSync(tempFilePath, filePath);
    } catch (writeError) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw writeError;
    }

    const publicUrl = `/uploads/images/${yearMonth}/${uniqueFilename}`;

    return NextResponse.json({
      url: publicUrl,
      filename: sanitizedOriginalName,
      originalName: sanitizedOriginalName,
      uniqueName: uniqueFilename,
      size: file.size,
      type: file.type,
      path: yearMonth,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(
      "Upload error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json({ error: "Upload failed" }, { status: 500 }); // Sanitized error message
  }
}
