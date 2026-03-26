import { runScoringCycle, config } from "../intel/cycle"

export default defineNitroPlugin((nitro) => {
  const intervalMs = config.cache.ttl_minutes * 60 * 1000

  // Run first cycle after 10s delay (let server fully start)
  const initialTimer = setTimeout(async () => {
    try {
      const db = useDatabase()
      const runtimeConfig = useRuntimeConfig()
      console.log("[intel] Running initial scoring cycle...")
      await runScoringCycle(db, runtimeConfig)
      console.log("[intel] Initial scoring cycle complete.")
    } catch (e) {
      console.error("[intel] Initial scoring cycle failed:", e)
    }
  }, 10000)

  // Then run every ttl_minutes (default 30min)
  const interval = setInterval(async () => {
    try {
      const db = useDatabase()
      const runtimeConfig = useRuntimeConfig()
      console.log(`[intel] Scheduled scoring cycle (every ${config.cache.ttl_minutes}min)...`)
      await runScoringCycle(db, runtimeConfig)
      console.log("[intel] Scheduled scoring cycle complete.")
    } catch (e) {
      console.error("[intel] Scheduled scoring cycle failed:", e)
    }
  }, intervalMs)

  // Cleanup on shutdown
  nitro.hooks.hook("close", () => {
    clearTimeout(initialTimer)
    clearInterval(interval)
  })
})
