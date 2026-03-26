import { describe, expect, it } from "vitest"
import type { NewsItem } from "@shared/types"
import { dedup, hashUrl } from "./dedup"

describe("hashUrl", () => {
  it("produces consistent SHA-256 hash for same URL", () => {
    const h1 = hashUrl("https://example.com/article/1")
    const h2 = hashUrl("https://example.com/article/1")
    expect(h1).toBe(h2)
    expect(h1).toHaveLength(16) // 16-char hex substring
  })

  it("produces different hashes for different URLs", () => {
    const h1 = hashUrl("https://example.com/a")
    const h2 = hashUrl("https://example.com/b")
    expect(h1).not.toBe(h2)
  })
})

describe("dedup", () => {
  it("filters out items whose URL hash is in existingIds", () => {
    const items: NewsItem[] = [
      { id: "1", title: "A", url: "https://a.com" },
      { id: "2", title: "B", url: "https://b.com" },
      { id: "3", title: "C", url: "https://c.com" },
    ]
    const existingIds = new Set([hashUrl("https://b.com")])
    const result = dedup(items, existingIds)
    expect(result).toHaveLength(2)
    expect(result.map(i => i.title)).toEqual(["A", "C"])
  })
})
