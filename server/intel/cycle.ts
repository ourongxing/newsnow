import type { IntelConfig } from "@shared/intel-types"
import intelConfig from "@shared/intel-config.json"
import { cleanExpiredScores, getExistingIds, initIntelTable, saveScores } from "./db"
import { fetchConfiguredSources } from "./sources"
import { createAnthropicCaller, createOpenAICaller, scoreItems } from "./scorer"
import type { CallAIFn } from "./scorer"
import { dedup, hashUrl } from "./dedup"

const config = intelConfig as IntelConfig

let refreshInProgress = false
let lastRefreshTime = 0
let tableInitialized = false

export function isRefreshInProgress(): boolean {
  return refreshInProgress
}

export function isCacheExpired(): boolean {
  return Date.now() / 1000 - lastRefreshTime > config.cache.ttl_minutes * 60
}

function createCaller(apiKey: string, provider: string, model: string, customBaseUrl?: string): CallAIFn {
  if (provider === "claude" || provider === "anthropic") {
    return createAnthropicCaller(apiKey, model, config.ai.max_tokens)
  }
  let baseUrl = "https://api.openai.com"
  if (customBaseUrl) baseUrl = customBaseUrl
  else if (provider === "deepseek") baseUrl = "https://api.deepseek.com"
  return createOpenAICaller(apiKey, model, config.ai.max_tokens, baseUrl)
}

export async function runScoringCycle(db: any, runtimeConfig: {
  AI_API_KEY: string
  AI_PROVIDER?: string
  AI_MODEL?: string
  AI_BASE_URL?: string
}): Promise<void> {
  if (refreshInProgress) return
  refreshInProgress = true

  try {
    if (!tableInitialized) {
      await initIntelTable(db)
      tableInitialized = true
    }

    const apiKey = runtimeConfig.AI_API_KEY
    if (!apiKey) throw new Error("AI_API_KEY not configured")

    const provider = runtimeConfig.AI_PROVIDER || config.ai.provider
    const model = runtimeConfig.AI_MODEL || config.ai.model
    const callAI = createCaller(apiKey, provider, model, runtimeConfig.AI_BASE_URL)

    const rawItems = await fetchConfiguredSources(config.sources)
    const urlHashes = rawItems.map(item => hashUrl(item.url))
    const existingIds = await getExistingIds(db, urlHashes)
    const newItems = dedup(rawItems, existingIds)

    if (newItems.length > 0) {
      const scored = await scoreItems(newItems, {
        weights: config.scoring.weights,
        batchSize: config.ai.batch_size,
        maxTokens: config.ai.max_tokens,
        callAI,
      })
      if (scored.length > 0) {
        await saveScores(db, scored)
      }
    }

    await cleanExpiredScores(db, config.cache.retention_days)
    lastRefreshTime = Math.floor(Date.now() / 1000)
  } finally {
    refreshInProgress = false
  }
}

export async function ensureTable(db: any) {
  if (!tableInitialized) {
    await initIntelTable(db)
    tableInitialized = true
  }
}

export { config }
