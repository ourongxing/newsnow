import process from "node:process"
import type { Database } from "db0"
import type { UserInfo } from "#/types"
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

export class UserTable {
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
        CREATE TABLE IF NOT EXISTS user (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255),
          data LONGTEXT,
          type VARCHAR(50),
          created BIGINT,
          updated BIGINT
        );
      `).run()
      await this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);
      `).run()
    } else {
      // SQLite syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS user (
          id TEXT PRIMARY KEY,
          email TEXT,
          data TEXT,
          type TEXT,
          created INTEGER,
          updated INTEGER
        );
      `).run()
      await this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);
      `).run()
    }
    logger.success(`init user table`)
  }

  async addUser(id: string, email: string, type: "github") {
    const u = await this.getUser(id)
    const now = Date.now()

    if (!u) {
      if (this.isMySQL) {
        // MySQL syntax - use ON DUPLICATE KEY UPDATE
        await this.db.prepare(`INSERT INTO user (id, email, data, type, created, updated) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), updated = VALUES(updated)`)
          .run(id, email, "", type, now, now)
      } else {
        // SQLite syntax
        await this.db.prepare(`INSERT INTO user (id, email, data, type, created, updated) VALUES (?, ?, ?, ?, ?, ?)`)
          .run(id, email, "", type, now, now)
      }
      logger.success(`add user ${id}`)
    } else if (u.email !== email && u.type !== type) {
      await this.db.prepare(`UPDATE user SET email = ?, updated = ? WHERE id = ?`).run(email, now, id)
      logger.success(`update user ${id} email`)
    } else {
      logger.info(`user ${id} already exists`)
    }
  }

  async getUser(id: string) {
    return (await this.db.prepare(`SELECT id, email, data, created, updated FROM user WHERE id = ?`).get(id)) as UserInfo
  }

  async setData(key: string, value: string, updatedTime = Date.now()) {
    const state = await this.db.prepare(
      `UPDATE user SET data = ?, updated = ? WHERE id = ?`,
    ).run(value, updatedTime, key)
    if (!state.success) throw new Error(`set user ${key} data failed`)
    logger.success(`set ${key} data`)
  }

  async getData(id: string) {
    const row: any = await this.db.prepare(`SELECT data, updated FROM user WHERE id = ?`).get(id)
    if (!row) throw new Error(`user ${id} not found`)
    logger.success(`get ${id} data`)
    return row as {
      data: string
      updated: number
    }
  }

  async deleteUser(key: string) {
    const state = await this.db.prepare(`DELETE FROM user WHERE id = ?`).run(key)
    if (!state.success) throw new Error(`delete user ${key} failed`)
    logger.success(`delete user ${key}`)
  }
}