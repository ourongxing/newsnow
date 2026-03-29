import { ensureTable, isRefreshInProgress, runScoringCycle } from "../../intel/cycle"

export default defineEventHandler(async (event) => {
  if (isRefreshInProgress()) {
    setResponseStatus(event, 409)
    return { error: "refresh_in_progress" }
  }

  const db = useDatabase()
  await ensureTable(db)
  const runtimeConfig = useRuntimeConfig()

  try {
    await runScoringCycle(db, runtimeConfig)
    return { status: "completed" }
  } catch (err) {
    console.error("[intel] Refresh scoring failed:", err)
    setResponseStatus(event, 500)
    return { error: "scoring_failed", message: String(err) }
  }
})
