import type { IntelItem, IntelResponse } from "@shared/intel-types"

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS intel_scores (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL,
    pub_date INTEGER, score REAL NOT NULL, summary TEXT, reason TEXT,
    scored_at INTEGER NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scores_score ON intel_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created ON intel_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_source ON intel_scores(source_id);
`

export async function initIntelTable(db: any) {
  await db.exec(CREATE_SQL)
}

export async function saveScores(db: any, items: IntelItem[]) {
  const sql = `INSERT OR REPLACE INTO intel_scores
    (id, source_id, title, url, pub_date, score, summary, reason, scored_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  const stmts = items.map(item =>
    db.prepare(sql).bind(
      item.id,
      item.source_id,
      item.title,
      item.url,
      item.pub_date,
      item.score,
      item.summary,
      item.reason,
      item.scored_at,
      item.created_at,
    ),
  )
  await db.batch(stmts)
}

export async function queryScores(db: any, params: {
  sort: "score" | "time"
  page: number
  limit: number
  sources?: string[]
  threshold?: number
}): Promise<IntelResponse> {
  const { sort, page, limit, sources, threshold = 0 } = params
  const offset = (page - 1) * limit
  const orderBy = sort === "score" ? "score DESC" : "created_at DESC"

  let where = "WHERE score >= ?"
  const bindValues: (string | number)[] = [threshold]

  if (sources && sources.length > 0) {
    const placeholders = sources.map(() => "?").join(", ")
    where += ` AND source_id IN (${placeholders})`
    bindValues.push(...sources)
  }

  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM intel_scores ${where}`,
  ).bind(...bindValues).all()
  const countRows = countResult?.results ?? countResult?.rows ?? countResult ?? []
  const total = (countRows[0] as { total: number })?.total ?? 0

  const result = await db.prepare(
    `SELECT * FROM intel_scores ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
  ).bind(...bindValues, limit, offset).all()
  const items = (result?.results ?? result?.rows ?? result ?? []) as unknown as IntelItem[]

  return {
    items,
    total,
    has_more: offset + limit < total,
    last_refreshed_at: items.length > 0 ? Math.max(...items.map(i => i.scored_at)) : null,
  }
}

export async function getExistingIds(db: any, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set()
  const placeholders = ids.map(() => "?").join(", ")
  const result = await db.prepare(
    `SELECT id FROM intel_scores WHERE id IN (${placeholders})`,
  ).bind(...ids).all()
  const rows = result?.results ?? result?.rows ?? result ?? []
  return new Set((rows as { id: string }[]).map(r => r.id))
}

export async function cleanExpiredScores(db: any, retentionDays: number) {
  const threshold = Math.floor(Date.now() / 1000) - retentionDays * 86400
  await db.prepare(`DELETE FROM intel_scores WHERE created_at < ?`).bind(threshold).run()
}
