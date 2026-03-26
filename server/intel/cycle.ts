import process from "node:process"
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

    const apiKey = runtimeConfig.AI_API_KEY || process.env.AI_API_KEY
    if (!apiKey) throw new Error("AI_API_KEY not configured")

    const provider = runtimeConfig.AI_PROVIDER || process.env.AI_PROVIDER || config.ai.provider
    const model = runtimeConfig.AI_MODEL || process.env.AI_MODEL || config.ai.model
    const baseUrl = runtimeConfig.AI_BASE_URL || process.env.AI_BASE_URL
    const callAI = createCaller(apiKey, provider, model, baseUrl)

    console.log(`[intel] Starting scoring cycle. Provider: ${provider}, Model: ${model}, BaseURL: ${baseUrl}`)
    const rawItems = await fetchConfiguredSources(config.sources)
    console.log(`[intel] Fetched ${rawItems.length} items from ${config.sources.length} sources`)
    const urlHashes = rawItems.map(item => hashUrl(item.url))
    const existingIds = await getExistingIds(db, urlHashes)
    const newItems = dedup(rawItems, existingIds)
    console.log(`[intel] After dedup: ${newItems.length} new items (${existingIds.size} already scored)`)

    if (newItems.length > 0) {
      console.log(`[intel] Scoring ${newItems.length} items in batches of ${config.ai.batch_size}...`)
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
