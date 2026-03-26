import { queryScores } from "../intel/db"
import { config, ensureTable, isCacheExpired, runScoringCycle } from "../intel/cycle"

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  await ensureTable(db)

  const query = getQuery(event)
  const sort = (query.sort as string) === "time" ? "time" : "score" as const
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const refresh = query.refresh === "true"
  const sourceFilter = query.source && query.source !== "all"
    ? (query.source as string).split(",")
    : undefined

  // Trigger async scoring if cache expired — do NOT block response
  if ((isCacheExpired() || refresh)) {
    const runtimeConfig = useRuntimeConfig()
    // Fire and forget — scoring runs in background
    runScoringCycle(db, runtimeConfig).catch(err =>
      console.error("[intel] Background scoring failed:", err),
    )
  }

  // Always return current DB data immediately (may be stale)
  return queryScores(db, {
    sort,
    page,
    limit,
    sources: sourceFilter,
    threshold: config.scoring.threshold,
  })
})
