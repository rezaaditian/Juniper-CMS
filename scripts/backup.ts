import fs from "fs"
import path from "path"

async function backup() {
  const dbPath = path.join(process.cwd(), "data", "app.db")
  const uploadsPath = path.join(process.cwd(), "public", "uploads")
  const backupDir = path.join(process.cwd(), "data", "backups")

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Generate timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, -5)

  const dbBackupPath = path.join(backupDir, `app-${timestamp}.db`)
  const uploadsBackupPath = path.join(backupDir, `uploads-${timestamp}`)

  console.log("Creating comprehensive backup...")
  console.log(`Database source: ${dbPath}`)
  console.log(`Database destination: ${dbBackupPath}`)
  console.log(`Uploads source: ${uploadsPath}`)
  console.log(`Uploads destination: ${uploadsBackupPath}`)

  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath)
      const totalSize = stats.size
      let copiedSize = 0

      const readStream = fs.createReadStream(dbPath)
      const writeStream = fs.createWriteStream(dbBackupPath)

      readStream.on("data", (chunk) => {
        copiedSize += chunk.length
        const progress = Math.round((copiedSize / totalSize) * 100)
        process.stdout.write(`\rDatabase backup progress: ${progress}%`)
      })

      await new Promise((resolve, reject) => {
        readStream.on("end", resolve)
        readStream.on("error", reject)
        readStream.pipe(writeStream)
      })

      console.log("\n✓ Database backup completed!")
    } else {
      console.log("⚠ Database file not found, skipping database backup")
    }

    if (fs.existsSync(uploadsPath)) {
      console.log("\nBacking up uploads directory...")

      function copyDirectory(src: string, dest: string) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true })
        }

        const items = fs.readdirSync(src)
        let fileCount = 0

        for (const item of items) {
          const srcPath = path.join(src, item)
          const destPath = path.join(dest, item)
          const stats = fs.statSync(srcPath)

          if (stats.isDirectory()) {
            copyDirectory(srcPath, destPath)
          } else {
            fs.copyFileSync(srcPath, destPath)
            fileCount++
            if (fileCount % 10 === 0) {
              process.stdout.write(`\rUploads backup: ${fileCount} files copied...`)
            }
          }
        }

        return fileCount
      }

      const totalFiles = copyDirectory(uploadsPath, uploadsBackupPath)
      console.log(`\n✓ Uploads backup completed! (${totalFiles} files)`)
    } else {
      console.log("⚠ Uploads directory not found, skipping uploads backup")
    }

    const manifest = {
      timestamp,
      created: new Date().toISOString(),
      database: {
        included: fs.existsSync(dbPath),
        path: fs.existsSync(dbPath) ? `app-${timestamp}.db` : null,
        size: fs.existsSync(dbPath) ? fs.statSync(dbBackupPath).size : 0,
      },
      uploads: {
        included: fs.existsSync(uploadsPath),
        path: fs.existsSync(uploadsPath) ? `uploads-${timestamp}` : null,
        fileCount: fs.existsSync(uploadsBackupPath) ? countFiles(uploadsBackupPath) : 0,
      },
    }

    const manifestPath = path.join(backupDir, `manifest-${timestamp}.json`)
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

    console.log("\n✓ Backup manifest created!")
    console.log(`\nBackup completed successfully!`)
    console.log(`Files created:`)
    if (manifest.database.included) console.log(`  - ${dbBackupPath}`)
    if (manifest.uploads.included) console.log(`  - ${uploadsBackupPath}/`)
    console.log(`  - ${manifestPath}`)
  } catch (error) {
    console.error("\n✗ Backup failed:", error)
  }
}

function countFiles(dir: string): number {
  let count = 0

  function countRecursive(currentDir: string) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const itemPath = path.join(currentDir, item)
      const stats = fs.statSync(itemPath)

      if (stats.isDirectory()) {
        countRecursive(itemPath)
      } else {
        count++
      }
    }
  }

  if (fs.existsSync(dir)) {
    countRecursive(dir)
  }

  return count
}

backup().catch(console.error)
