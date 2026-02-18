import fs from "fs"
import path from "path"
import { run } from "../lib/db"

const migrationsDir = path.join(process.cwd(), "data", "test")

async function migrate() {
  console.log("Running database migrations...")

  if (!fs.existsSync(migrationsDir)) {
    console.log("No migrations directory found")
    return
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()

  for (const file of files) {
    console.log(`Running migration: ${file}`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")

    // Split by semicolon and run each statement
    const statements = sql.split(";").filter((stmt) => stmt.trim())

    for (const statement of statements) {
      if (statement.trim()) {
        run(statement)
      }
    }

    console.log(`✓ ${file} completed`)
  }

  console.log("All migrations completed successfully!")
}

migrate().catch(console.error)
