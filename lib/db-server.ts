import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"

const dbPath = path.join(process.cwd(), "data", "app.db")
let db: Database.Database | null = null
let isInitialized = false

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath, {
      fileMustExist: false,
    })
    db.pragma("journal_mode = WAL")
    db.pragma("synchronous = NORMAL")
    db.pragma("cache_size = 1000")
    db.pragma("temp_store = memory")
  }
  return db
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  try {
    const database = getDatabase()
    const stmt = database.prepare(sql)
    const result = stmt.all(...params)
    return result as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export function run(sql: string, params: any[] = []): Database.RunResult {
  try {
    const database = getDatabase()
    const stmt = database.prepare(sql)
    return stmt.run(...params)
  } catch (error) {
    console.error("Database run error:", error)
    throw error
  }
}

export function initializeDatabase(): void {
  if (isInitialized) return

  try {
    const database = getDatabase()

    // Check if tables exist before creating
    const tables = query<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table'")
    const tableNames = tables.map((t) => t.name)

    // Create tables only if they don't exist
    if (!tableNames.includes("posts")) {
      database.exec(`
        CREATE TABLE posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          category TEXT,
          featured_image TEXT,
          published INTEGER DEFAULT 0,
          published_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("categories")) {
      database.exec(`
        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("services")) {
      database.exec(`
        CREATE TABLE services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          content TEXT,
          icon TEXT,
          order_index INTEGER DEFAULT 0,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("testimonials")) {
      database.exec(`
        CREATE TABLE testimonials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          title TEXT,
          company TEXT,
          content TEXT NOT NULL,
          rating INTEGER DEFAULT 5,
          featured INTEGER DEFAULT 0,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("contact_info")) {
      database.exec(`
        CREATE TABLE contact_info (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("users")) {
      database.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create default admin user only if no users exist
      const userCount = query<{ count: number }>("SELECT COUNT(*) as count FROM users")[0]
      if (userCount.count === 0) {
        const hashedPassword = bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASSWORD || "admin123", 10)
        run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ["admin", hashedPassword, "admin"])
      }
    }

    isInitialized = true
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

// Initialize database when module is imported (server-side only)
if (typeof window === "undefined") {
  initializeDatabase()
}
