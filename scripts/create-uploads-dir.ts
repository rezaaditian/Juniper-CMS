import fs from "fs"
import path from "path"

// Create the uploads directory structure
const uploadsDir = path.join(process.cwd(), "public", "uploads", "images")

console.log("Creating uploads directory structure...")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("✅ Created uploads directory:", uploadsDir)
} else {
  console.log("✅ Uploads directory already exists:", uploadsDir)
}

// Create a .gitkeep file to ensure the directory is tracked in git
const gitkeepPath = path.join(uploadsDir, ".gitkeep")
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, "")
  console.log("✅ Created .gitkeep file")
}

console.log("✅ Uploads directory setup complete!")
