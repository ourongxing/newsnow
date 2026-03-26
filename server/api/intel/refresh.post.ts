import { ensureTable, isRefreshInProgress, runScoringCycle } from "../../intel/cycle"

export default defineEventHandler(async (event) => {
  if (isRefreshInProgress()) {
    setResponseStatus(event, 409)
    return { error: "refresh_in_progress" }
  }

  const runtimeConfig = useRuntimeConfig()
  if (!runtimeConfig.AI_API_KEY) {
    setResponseStatus(event, 500)
    return { error: "ai_api_unavailable", message: "AI_API_KEY not configured" }
  }

  const db = useDatabase()
  await ensureTable(db)

  // Fire and forget — return immediately
  runScoringCycle(db, runtimeConfig).catch(err =>
    console.error("[intel] Refresh scoring failed:", err),
  )

  return { status: "started" }
})
