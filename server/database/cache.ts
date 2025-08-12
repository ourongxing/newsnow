import process from "node:process"
import type { NewsItem } from "@shared/types"
import type { Database } from "db0"
import type { CacheInfo, CacheRow } from "../types"

// 改进的数据库类型检测函数
function isMySQLDatabase(): boolean {
  const hasMySQLConfig = process.env.MYSQL_HOST && 
                        process.env.MYSQL_USER && 
                        process.env.MYSQL_PASSWORD && 
                        process.env.MYSQL_DATABASE
  
  if (hasMySQLConfig) {
    console.log('🔗 Using MySQL database')
    return true
  } else {
    console.log('🗃️ Using SQLite database')
    return false
  }
}

export class Cache {
  private db
  private isMySQL: boolean
  
  constructor(db: Database) {
    this.db = db
    this.isMySQL = isMySQLDatabase()
  }

  async init() {
    if (this.isMySQL) {
      // MySQL syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS cache (
          id VARCHAR(255) PRIMARY KEY,
          updated BIGINT,
          data TEXT
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
    const keysStr = keys.map(k => `id = '${k}'`).join(" or ")
    const res = await this.db.prepare(`SELECT id, data, updated FROM cache WHERE ${keysStr}`).all() as any
    const rows = (res.results ?? res) as CacheRow[]

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
