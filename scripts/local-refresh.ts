import path from "node:path"
import process from "node:process"
import fs from "node:fs" // Import fs for directory creation
import { fileURLToPath } from "node:url"
import type { NewsItem, SourceID } from "@shared/types"
import SQLite from "better-sqlite3" // Re-import SQLite directly
import sourcesConfig from "../shared/sources.json"
import { Cache } from "../server/database/cache" // Import Cache class directly
import { logger } from "../server/utils/logger"
import type { SourceGetter } from "../server/types"

// --- Configuration ---
const sourceIdsToRefresh = Object.keys(sourcesConfig) as SourceID[]
const baseDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(baseDir, "..") // Assuming script is in projectRoot/scripts
const sourcesDir = path.resolve(projectRoot, "server/sources")
const dbDir = path.resolve(projectRoot, ".nitro/db") // Default Nitro DB location
const dbPath = path.join(dbDir, "database.sqlite") // Default DB file name

// --- Main Refresh Logic ---
async function refreshLocalCache() {
  logger.info("Starting local cache refresh...")

  let cacheTable: Cache | undefined
  let sqliteInstance: SQLite.Database | null = null // Declare SQLite instance variable

  try {
    // Ensure the database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      logger.info(`Created database directory: ${dbDir}`)
    }

    // Create database connection directly using better-sqlite3
    logger.info(`Connecting directly to SQLite database at: ${dbPath}`)
    sqliteInstance = new SQLite(dbPath) // Create the instance
    const db = sqliteInstance // Use the direct instance

    // Instantiate Cache class with the manual db connection
    // This will cause a type error initially, we'll fix Cache constructor next
    cacheTable = new Cache(db) // Pass the direct instance (constructor now accepts it)

    // Manually initialize the cache table if needed (mimics getCacheTable logic)
    if (process.env.INIT_TABLE !== "false") {
      await cacheTable.init() // Explicitly call init
    }
    logger.success("Cache table initialized successfully.")
  } catch (error: any) {
    logger.error(`Failed to initialize database or cache table: ${error.message || error}`)
    if (error.stack) {
      logger.error(error.stack)
    }
    process.exit(1) // Exit if cache/db setup fails
  }

  // Ensure cacheTable is defined before proceeding
  if (!cacheTable) {
    logger.error("Cache table instance is not available. Aborting refresh.")
    process.exit(1)
  }

  let successCount = 0
  let errorCount = 0

  for (const id of sourceIdsToRefresh) {
    // Type-safe check for the 'redirect' property
    const config = sourcesConfig[id]
    if (config && "redirect" in config) {
      logger.info(`Skipping source "${id}" due to redirect configuration.`)
      continue
    }

    const sourceFilePath = path.join(sourcesDir, `${id}.ts`)
    const sourceFileURL = `file://${sourceFilePath}` // Use file URL for dynamic import

    // Check if the source file actually exists before trying to import
    if (!fs.existsSync(sourceFilePath)) {
      logger.warn(`Source file not found for "${id}" at ${sourceFilePath}. Skipping.`)
      errorCount++ // Count as an error or skip silently? Let's count as error for now.
      continue
    }

    try {
      logger.info(`Refreshing source: ${id}`)

      const module = await import(sourceFileURL)
      const getter = module.default as SourceGetter | undefined

      if (typeof getter !== "function") {
        logger.warn(`Source file for "${id}" does not have a default export function. Skipping.`)
        errorCount++
        continue
      }

      const items: NewsItem[] = await getter()

      if (items && Array.isArray(items)) {
        await cacheTable.set(id, items) // Use the manually created cacheTable instance
        logger.success(`Successfully refreshed source: ${id}, found ${items.length} items.`)
        successCount++
      } else {
        logger.warn(`Source "${id}" getter did not return a valid array. Skipping cache set.`)
        successCount++
      }
    } catch (error: any) {
      logger.error(`Failed to refresh source "${id}": ${error.message || error}`)
      if (error.stack) {
        logger.error(error.stack)
      }
      errorCount++
    }
  }

  logger.info(`Local cache refresh finished. Success: ${successCount}, Errors: ${errorCount}`)

  // Close the direct SQLite connection
  if (sqliteInstance && typeof sqliteInstance.close === "function") {
    sqliteInstance.close()
    logger.info("Database connection closed.")
  }
}

// --- Execute Refresh ---
refreshLocalCache().catch((error) => {
  logger.error("Unhandled error during cache refresh execution:", error)
  process.exit(1)
})
