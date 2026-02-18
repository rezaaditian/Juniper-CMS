import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"

// Server-only database module
const dbPath = path.join(process.cwd(), "data", "app.db")
let db: Database.Database | null = null
let isInitialized = false

// Ensure data directory exists (server-side only)
if (typeof window === "undefined") {
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    try {
      fs.chmodSync(dataDir, 0o750) // rwxr-x--- (owner: rwx, group: r-x, others: none)
    } catch (error) {
      console.warn("Could not set directory permissions:", error)
    }
  }
}

function getDatabase(): Database.Database {
  if (typeof window !== "undefined") {
    throw new Error("Database access is not allowed on the client side")
  }

  if (!db) {
    db = new Database(dbPath, {
      fileMustExist: false,
    })

    db.pragma("journal_mode = WAL")
    db.pragma("synchronous = NORMAL")
    db.pragma("cache_size = 1000")
    db.pragma("temp_store = memory")
    db.pragma("foreign_keys = ON") // Enable foreign key constraints
    db.pragma("secure_delete = ON") // Overwrite deleted data

    try {
      fs.chmodSync(dbPath, 0o640) // rw-r----- (owner: rw, group: r, others: none)
    } catch (error) {
      console.warn("Could not set database file permissions:", error)
    }
  }
  return db
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  if (typeof window !== "undefined") {
    console.warn("Database query attempted on client-side")
    return []
  }

  try {
    if (!sql || typeof sql !== "string") {
      throw new Error("Invalid SQL query")
    }

    if (!Array.isArray(params)) {
      throw new Error("Parameters must be an array")
    }

    const sanitizedParams = params.map((param) => {
      if (typeof param === "string" && param.length > 40000) {
        throw new Error("Parameter too long")
      }
      return param
    })

    const database = getDatabase()
    const stmt = database.prepare(sql)
    const result = stmt.all(...sanitizedParams)
    return result as T[]
  } catch (error) {
    console.error("Database query error:", error instanceof Error ? error.message : "Unknown error")
    throw error
  }
}

export function get<T = any>(sql: string, params: any[] = []): T | undefined {
  if (typeof window !== "undefined") {
    console.warn("Database get attempted on client-side")
    return undefined
  }

  try {
    if (!sql || typeof sql !== "string") {
      throw new Error("Invalid SQL query")
    }

    if (!Array.isArray(params)) {
      throw new Error("Parameters must be an array")
    }

    const sanitizedParams = params.map((param) => {
      if (typeof param === "string" && param.length > 40000) {
        throw new Error("Parameter too long")
      }
      return param
    })

    const database = getDatabase()
    const stmt = database.prepare(sql)
    const result = stmt.get(...sanitizedParams)
    return result as T | undefined
  } catch (error) {
    console.error("Database get error:", error instanceof Error ? error.message : "Unknown error")
    throw error
  }
}

export function run(sql: string, params: any[] = []): Database.RunResult {
  if (typeof window !== "undefined") {
    throw new Error("Database run is not allowed on the client side")
  }

  try {
    if (!sql || typeof sql !== "string") {
      throw new Error("Invalid SQL query")
    }

    if (!Array.isArray(params)) {
      throw new Error("Parameters must be an array")
    }

    const sanitizedParams = params.map((param) => {
      if (typeof param === "string" && param.length > 40000) {
        throw new Error("Parameter too long")
      }
      return param
    })

    const database = getDatabase()
    const stmt = database.prepare(sql)
    return stmt.run(...sanitizedParams)
  } catch (error) {
    console.error("Database run error:", error instanceof Error ? error.message : "Unknown error")
    throw error
  }
}

export function initializeDatabase(): void {
  if (typeof window !== "undefined" || isInitialized) return

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
          title TEXT NOT NULL CHECK(length(title) <= 200),
          slug TEXT UNIQUE NOT NULL CHECK(length(slug) <= 200),
          content TEXT NOT NULL,
          excerpt TEXT CHECK(length(excerpt) <= 500),
          category TEXT CHECK(length(category) <= 100),
          featured_image TEXT CHECK(length(featured_image) <= 500),
          published INTEGER DEFAULT 0 CHECK(published IN (0, 1)),
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
          name TEXT NOT NULL CHECK(length(name) <= 100),
          slug TEXT UNIQUE NOT NULL CHECK(length(slug) <= 100),
          description TEXT CHECK(length(description) <= 500),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("services")) {
      database.exec(`
        CREATE TABLE services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL CHECK(length(title) <= 200),
          slug TEXT UNIQUE NOT NULL CHECK(length(slug) <= 200),
          description TEXT CHECK(length(description) <= 500),
          content TEXT,
          icon TEXT CHECK(length(icon) <= 100),
          order_index INTEGER DEFAULT 0 CHECK(order_index >= 0),
          active INTEGER DEFAULT 1 CHECK(active IN (0, 1)),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("testimonials")) {
      database.exec(`
        CREATE TABLE testimonials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL CHECK(length(name) <= 100),
          title TEXT CHECK(length(title) <= 100),
          company TEXT CHECK(length(company) <= 100),
          content TEXT NOT NULL CHECK(length(content) <= 1000),
          rating INTEGER DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
          featured INTEGER DEFAULT 0 CHECK(featured IN (0, 1)),
          active INTEGER DEFAULT 1 CHECK(active IN (0, 1)),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("contact_info")) {
      database.exec(`
        CREATE TABLE contact_info (
          key TEXT PRIMARY KEY CHECK(length(key) <= 100),
          value TEXT NOT NULL CHECK(length(value) <= 1000),
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!tableNames.includes("users")) {
      database.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL CHECK(length(username) <= 50 AND length(username) >= 3),
          password_hash TEXT NOT NULL CHECK(length(password_hash) >= 50),
          role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'user')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create default admin user only if no users exist
      const userCount = query<{ count: number }>("SELECT COUNT(*) as count FROM users")[0]
      if (userCount.count === 0) {
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123"
        if (defaultPassword.length < 8) {
          console.warn("⚠️  Default admin password is too weak. Please set ADMIN_DEFAULT_PASSWORD to a strong password.")
        }
        const hashedPassword = bcrypt.hashSync(defaultPassword, 12) // Increased salt rounds
        run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ["admin", hashedPassword, "admin"])
      }
    }

    // Insert default data only if tables are empty
    // const servicesCount = query<{ count: number }>("SELECT COUNT(*) as count FROM services")[0]
    // if (servicesCount.count === 0) {
    //   run(`INSERT INTO services (title, slug, description, content, order_index) VALUES
    //     ('Proposal Management', 'proposal-management', 'Comprehensive proposal management services tailored to organizations of all sizes and maturity levels.', 'With over 15 years of experience supporting clients in the public and private sectors, I offer comprehensive proposal management services tailored to organizations of all sizes and maturity levels. My approach emphasizes compliance, clarity, and competitiveness, ensuring every submission is strategically positioned for success.', 1),
    //     ('Proposal Coordination', 'proposal-coordination', 'Seamless coordination keeping every piece of the process moving with precision and clarity.', 'Efficient proposal development hinges on seamless coordination, and that''s where we step in. We offer proposal coordination services designed to keep every piece of the process moving with precision and clarity, enabling proposal managers and teams to focus on strategy and content quality.', 2)`)
    // }
    const servicesCount = query<{ count: number }>(
      "SELECT COUNT(*) as count FROM services"
    )[0]

    if (servicesCount.count === 0) {
      const insertService = db?.prepare(
        `INSERT INTO services (title, slug, description, content, order_index) 
       VALUES (?, ?, ?, ?, ?)`
      )

      insertService.run(
        "Proposal Management",
        "proposal-management",
        "Comprehensive proposal management services tailored to organizations of all sizes and maturity levels.",
        JSON.stringify({
          root: {
            type: "root",
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "ltr",
                children: [
                  {
                    type: "text",
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "With over 15 years of experience supporting clients in the public and private sectors, I offer comprehensive proposal management services tailored to organizations of all sizes and maturity levels. My approach emphasizes compliance, clarity, and competitiveness, ensuring every submission is strategically positioned for success.",
                  },
                ],
              },
            ],
          },
        }),
        1
      )

      insertService.run(
        "Proposal Coordination",
        "proposal-coordination",
        "Seamless coordination keeping every piece of the process moving with precision and clarity.",
        JSON.stringify({
          root: {
            type: "root",
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "ltr",
                children: [
                  {
                    type: "text",
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Efficient proposal development hinges on seamless coordination, and that's where we step in. We offer proposal coordination services designed to keep every piece of the process moving with precision and clarity, enabling proposal managers and teams to focus on strategy and content quality.",
                  },
                ],
              },
            ],
          },
        }),
        2
      )
    }


    const contactCount = query<{ count: number }>("SELECT COUNT(*) as count FROM contact_info")[0]
    if (contactCount.count === 0) {
      run(`INSERT INTO contact_info (key, value) VALUES 
        ('email', 'hello@juniperproposals.com'),
        ('phone', '(555) 123-4567'),
        ('location', 'Nationwide Service'),
        ('hero_title', 'Proposal Management'),
        ('hero_subtitle', 'Creating winning proposals that deliver exceptional results.'),
        ('contact_title', 'Let''s work together'),
        ('contact_description', 'Ready to win your next proposal? Contact us today to get started with professional proposal management services.')`)
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
