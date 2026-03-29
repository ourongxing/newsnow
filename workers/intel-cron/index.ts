export default {
  async scheduled(_event: ScheduledEvent, env: Env) {
    const url = `${env.SITE_URL}/api/intel/refresh`
    console.log(`[intel-cron] Triggering scoring at ${url}`)
    const res = await fetch(url, { method: "POST" })
    const body = await res.text()
    console.log(`[intel-cron] Response ${res.status}: ${body}`)
  },
}

interface Env {
  SITE_URL: string
}
