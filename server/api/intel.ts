import { queryScores } from "../intel/db"
import { config, ensureTable } from "../intel/cycle"

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  await ensureTable(db)

  const query = getQuery(event)
  const sort = (query.sort as string) === "time" ? "time" : "score" as const
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const sourceFilter = query.source && query.source !== "all"
    ? (query.source as string).split(",")
    : undefined

  return queryScores(db, {
    sort,
    page,
    limit,
    sources: sourceFilter,
    threshold: config.scoring.threshold,
  })
})
