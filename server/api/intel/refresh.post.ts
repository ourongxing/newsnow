import { ensureTable, isRefreshInProgress, runScoringCycle } from "../../intel/cycle"

export default defineEventHandler(async (event) => {
  if (isRefreshInProgress()) {
    setResponseStatus(event, 409)
    return { error: "refresh_in_progress" }
  }

  const runtimeConfig = useRuntimeConfig()
  const apiKey = runtimeConfig.AI_API_KEY
  if (!apiKey) {
    setResponseStatus(event, 500)
    return { error: "ai_api_unavailable", message: "AI_API_KEY not configured" }
  }

  const db = useDatabase()
  await ensureTable(db)

  try {
    await runScoringCycle(db, { ...runtimeConfig, AI_API_KEY: apiKey })
    return { status: "completed" }
  } catch (err) {
    console.error("[intel] Refresh scoring failed:", err)
    setResponseStatus(event, 500)
    return { error: "scoring_failed", message: String(err) }
  }
})
