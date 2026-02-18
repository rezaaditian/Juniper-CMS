import fs from "fs"
import path from "path"
import { initializeDatabase } from "../lib/db"

console.log("🚀 Setting up Juniper Proposals system...")

async function setupSystem() {
  try {
    // 1. Create uploads directory structure
    console.log("📁 Creating uploads directory structure...")
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    const imagesDir = path.join(uploadsDir, "images")

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log("✅ Created public/uploads directory")
    }

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
      console.log("✅ Created public/uploads/images directory")
    }

    // 2. Create data directory for database
    console.log("📁 Creating data directory...")
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log("✅ Created data directory")
    }

    // 3. Create backups directory
    const backupsDir = path.join(dataDir, "backups")
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
      console.log("✅ Created data/backups directory")
    }

    // 4. Initialize database
    console.log("🗄️ Initializing database...")
    initializeDatabase()
    console.log("✅ Database initialized with tables and default data")

    // 5. Check environment variables
    console.log("🔧 Checking environment variables...")
    if (!process.env.SESSION_SECRET) {
      console.log("⚠️  SESSION_SECRET not found in environment variables")
      console.log("   Please copy .env.example to .env and set a secure SESSION_SECRET")
    } else {
      console.log("✅ SESSION_SECRET configured")
    }

    console.log("\n🎉 System setup complete!")
    console.log("\n📋 Next steps:")
    console.log("1. Copy .env.example to .env and configure your environment variables")
    console.log("2. Run 'npm run dev' to start the development server")
    console.log("3. Visit http://localhost:3000/admin to access the admin panel")
    console.log("4. Default admin credentials: admin / admin123 (change after first login)")
  } catch (error) {
    console.error("❌ Setup failed:", error)
    process.exit(1)
  }
}

setupSystem()
