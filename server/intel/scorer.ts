import type { NewsItem } from "@shared/types"
import type { IntelItem, IntelScoringWeights } from "@shared/intel-types"
import { $fetch } from "ofetch"
import { hashUrl } from "./dedup"

interface ScoredResult {
  id: string // "item_1", "item_2", etc.
  score: number
  summary: string
  reason: string
}

export function buildScoringPrompt(
  items: (NewsItem & { _sourceId: string })[],
  weights: IntelScoringWeights,
): string {
  const itemsList = items.map((item, i) => {
    const time = item.pubDate
      ? new Date(typeof item.pubDate === "number" ? item.pubDate * 1000 : item.pubDate).toISOString()
      : "unknown"
    return `item_${i + 1}. [${item.title}] [${item._sourceId}] [${time}]`
  }).join("\n")

  return `You are a tech news analyst. Score each item below on a scale of 1.0-10.0 (one decimal place). Provide a one-line Chinese summary and scoring rationale in Chinese.

Scoring dimensions and weights:
- Technical depth: ${weights.depth}%
- Industry trends: ${weights.trend}%
- Practicality: ${weights.practical}%

News items:
${itemsList}

Output ONLY a JSON array. Each object must use the exact item ID shown above (item_1, item_2, etc.):
[{"id": "item_1", "score": 8.5, "summary": "一句话中文摘要", "reason": "中文打分理由"}]`
}

export function parseScoringResponse(raw: string): ScoredResult[] {
  let jsonStr = raw.trim()
  // Match optional "json" language tag, then capture content until closing ```
  const codeBlockMatch = jsonStr.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim()
  const parsed = JSON.parse(jsonStr)
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array")
  return parsed
}

// callAI is injected as a dependency for testability
export type CallAIFn = (prompt: string) => Promise<string>

export function createAnthropicCaller(
  apiKey: string,
  model: string,
  maxTokens: number,
): CallAIFn {
  return async (prompt: string) => {
    const response = await $fetch<{ content: { text: string }[] }>(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: { model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] },
        timeout: 30000,
      },
    )
    return response.content[0].text
  }
}

export function createOpenAICaller(
  apiKey: string,
  model: string,
  maxTokens: number,
  baseUrl = "https://api.openai.com",
): CallAIFn {
  return async (prompt: string) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 120000)
    try {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`AI API error ${res.status}: ${text}`)
      }
      const data = await res.json() as { choices: { message: { content: string } }[] }
      return data.choices[0].message.content
    } finally {
      clearTimeout(timer)
    }
  }
}

export async function scoreItems(
  items: (NewsItem & { _sourceId: string })[],
  config: {
    weights: IntelScoringWeights
    batchSize: number
    maxTokens: number
    callAI: CallAIFn
  },
): Promise<IntelItem[]> {
  const { weights, batchSize, callAI } = config
  const now = Math.floor(Date.now() / 1000)
  const allScored: IntelItem[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const prompt = buildScoringPrompt(batch, weights)

    let retries = 0

    while (retries < 3) {
      try {
        let raw = await callAI(prompt)
        let scores: ScoredResult[]
        try {
          scores = parseScoringResponse(raw)
        } catch {
          // Retry with stricter prompt on malformed JSON
          raw = await callAI(`${prompt}\n\nYou MUST return valid JSON only. No markdown, no explanation.`)
          scores = parseScoringResponse(raw)
        }

        for (const score of scores) {
          const match = score.id.match(/item_(\d+)/)
          const idx = match ? Number.parseInt(match[1]) - 1 : -1
          if (idx >= 0 && idx < batch.length) {
            const item = batch[idx]
            allScored.push({
              id: hashUrl(item.url),
              source_id: item._sourceId,
              title: item.title,
              url: item.url,
              pub_date: typeof item.pubDate === "number" ? item.pubDate : null,
              score: score.score,
              summary: score.summary,
              reason: score.reason,
              scored_at: now,
              created_at: now,
            })
          }
        }
        break
      } catch (error: any) {
        retries++
        if (retries >= 3) {
          console.error(`[intel] Scoring batch failed after 3 retries:`, error)
        }
      }
    }
  }
  return allScored
}
