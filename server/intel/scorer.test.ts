import { describe, expect, it, vi } from "vitest"
import type { NewsItem } from "@shared/types"
import { buildScoringPrompt, parseScoringResponse, scoreItems } from "./scorer"

describe("buildScoringPrompt", () => {
  it("includes weights, items, and explicit item IDs", () => {
    const items = [
      { id: "1", title: "Test Article", url: "https://x.com", _sourceId: "hackernews" },
    ] as (NewsItem & { _sourceId: string })[]
    const prompt = buildScoringPrompt(items, { depth: 40, trend: 35, practical: 25 })
    expect(prompt).toContain("Technical depth: 40%")
    expect(prompt).toContain("item_1")
    expect(prompt).toContain("Test Article")
  })
})

describe("parseScoringResponse", () => {
  it("parses valid JSON", () => {
    const raw = JSON.stringify([{ id: "item_1", score: 8.5, summary: "Good", reason: "Deep" }])
    const result = parseScoringResponse(raw)
    expect(result[0].score).toBe(8.5)
  })

  it("extracts JSON from markdown code blocks", () => {
    const raw = "```json\n[{\"id\":\"item_1\",\"score\":7.0,\"summary\":\"s\",\"reason\":\"r\"}]\n```"
    expect(parseScoringResponse(raw)).toHaveLength(1)
  })

  it("throws on invalid JSON", () => {
    expect(() => parseScoringResponse("not json")).toThrow()
  })
})

describe("scoreItems", () => {
  it("processes items in batches and returns IntelItems", async () => {
    const mockCallAI = vi.fn().mockResolvedValue(
      JSON.stringify([
        { id: "item_1", score: 8.0, summary: "Summary", reason: "Reason" },
      ]),
    )
    const items = [
      { id: "1", title: "Article", url: "https://x.com/1", pubDate: 1000, _sourceId: "hn" },
    ] as (NewsItem & { _sourceId: string })[]

    const result = await scoreItems(items, {
      weights: { depth: 40, trend: 35, practical: 25 },
      batchSize: 20,
      maxTokens: 3000,
      callAI: mockCallAI,
    })

    expect(result).toHaveLength(1)
    expect(result[0].score).toBe(8.0)
    expect(result[0].source_id).toBe("hn")
    expect(mockCallAI).toHaveBeenCalledTimes(1)
  })

  it("handles partial AI failure gracefully", async () => {
    const mockCallAI = vi.fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockRejectedValueOnce(new Error("timeout"))
      .mockRejectedValueOnce(new Error("timeout"))

    const items = [
      { id: "1", title: "A", url: "https://a.com", _sourceId: "hn" },
    ] as (NewsItem & { _sourceId: string })[]

    const result = await scoreItems(items, {
      weights: { depth: 40, trend: 35, practical: 25 },
      batchSize: 20,
      maxTokens: 3000,
      callAI: mockCallAI,
    })

    expect(result).toHaveLength(0)
  })
})
