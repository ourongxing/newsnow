import process from "node:process"
import type { NewsItem } from "@shared/types"
import type { Database } from "db0"
import type { CacheInfo, CacheRow } from "../types"
import { logger } from "#/utils/logger"

// Improved database type detection function
function isMySQLDatabase(db: Database): boolean {
  try {
    // First check if all required MySQL environment variables are present
    if (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE) {
      console.log('🔗 Using MySQL database (based on environment variables)')
      return true
    }
    
    // Fallback to detecting the actual database type through the db instance
    const dbInstance = (db as any).getInstance?.()
    if (dbInstance) {
      // For db0 database, check the connector name
      const connectorName = dbInstance.connector?.name?.toLowerCase()
      if (connectorName && connectorName.includes('mysql')) {
        console.log('🔗 Using MySQL database (detected from instance)')
        return true
      } else if (connectorName && (connectorName.includes('sqlite') || connectorName.includes('sqlite3') || connectorName.includes('bun-sqlite') || connectorName.includes('cloudflare-d1'))) {
        console.log('🗃️ Using SQLite-compatible database (detected from instance)')
        return false
      }
    }
  } catch (e) {
    // If detection fails, default to SQLite
    logger.warn('Failed to detect database type from instance, defaulting to SQLite')
  }
  
  // Default to SQLite
  console.log('🗃️ Using SQLite database (default)')
  return false
}

export class Cache {
  private db
  private isMySQL: boolean
  
  constructor(db: Database) {
    this.db = db
    this.isMySQL = isMySQLDatabase(db)
  }

  async init() {
    if (this.isMySQL) {
      // MySQL syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS cache (
          id VARCHAR(255) PRIMARY KEY,
          updated BIGINT,
          data LONGTEXT
        );
      `).run()
    } else {
      // SQLite syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS cache (
          id TEXT PRIMARY KEY,
          updated INTEGER,
          data TEXT
        );
      `).run()
    }
    logger.success(`init cache table`)
  }

  async set(key: string, value: NewsItem[]) {
    const now = Date.now()
    
    if (this.isMySQL) {
      // MySQL syntax - use ON DUPLICATE KEY UPDATE
      await this.db.prepare(
        `INSERT INTO cache (id, data, updated) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated = VALUES(updated)`,
      ).run(key, JSON.stringify(value), now)
    } else {
      // SQLite syntax - use INSERT OR REPLACE
      await this.db.prepare(
        `INSERT OR REPLACE INTO cache (id, data, updated) VALUES (?, ?, ?)`,
      ).run(key, JSON.stringify(value), now)
    }
    logger.success(`set ${key} cache`)
  }

  async get(key: string): Promise<CacheInfo | undefined > {
    const row = (await this.db.prepare(`SELECT id, data, updated FROM cache WHERE id = ?`).get(key)) as CacheRow | undefined
    if (row) {
      logger.success(`get ${key} cache`)
      return {
        id: row.id,
        updated: row.updated,
        items: JSON.parse(row.data),
      }
    }
  }

  async getEntire(keys: string[]): Promise<CacheInfo[]> {
    if (keys.length === 0) return []
    
    let rows: CacheRow[] = []
    if (this.isMySQL) {
      // For MySQL, use placeholders for better security
      const placeholders = keys.map(() => '?').join(', ')
      const res = await this.db.prepare(`SELECT id, data, updated FROM cache WHERE id IN (${placeholders})`).all(...keys) as any
      rows = (res.results ?? res) as CacheRow[]
    } else {
      // Existing SQLite implementation
      const keysStr = keys.map(k => `id = '${k}'`).join(" or ")
      const res = await this.db.prepare(`SELECT id, data, updated FROM cache WHERE ${keysStr}`).all() as any
      rows = (res.results ?? res) as CacheRow[]
    }

    /**
     * https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/#return-object
     * cloudflare d1 .all() will return
     * {
     *   success: boolean
     *   meta:
     *   results:
     * }
     */
    if (rows?.length) {
      logger.success(`get entire (...) cache`)
      return rows.map(row => ({
        id: row.id,
        updated: row.updated,
        items: JSON.parse(row.data) as NewsItem[],
      }))
    } else {
      return []
    }
  }

  async delete(key: string) {
    return await this.db.prepare(`DELETE FROM cache WHERE id = ?`).run(key)
  }
}

export async function getCacheTable() {
  try {
    const db = useDatabase()
    // logger.info("db: ", db.getInstance())
    if (process.env.ENABLE_CACHE === "false") return
    const cacheTable = new Cache(db)
    if (process.env.INIT_TABLE !== "false") await cacheTable.init()
    return cacheTable
  } catch (e) {
    logger.error("failed to init database ", e)
  }
}