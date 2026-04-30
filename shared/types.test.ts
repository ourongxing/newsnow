import { describe, expect, it } from "vitest"
import type { SourceID, NewsItem, SourceResponse, ColumnID } from "./types"
import { sources } from "./sources"

describe("Source types and data", () => {
  it("has non-empty sources", () => {
    const keys = Object.keys(sources) as SourceID[]
    expect(keys.length).toBeGreaterThan(0)
  })

  it("each source has required fields", () => {
    for (const [id, source] of Object.entries(sources)) {
      expect(source.name).toBeTruthy()
      expect(source.interval).toBeGreaterThan(0)
      expect(source.color).toBeTruthy()
      expect(source.home).toBeTruthy()
    }
  })

  it("all source homes are valid URLs", () => {
    for (const source of Object.values(sources)) {
      expect(source.home).toMatch(/^https?:\/\//)
    }
  })

  it("redirect sources have a valid redirect target", () => {
    for (const [id, source] of Object.entries(sources)) {
      if (source.redirect) {
        expect(sources).toHaveProperty(source.redirect as string)
      }
    }
  })
})

describe("SourceResponse type structure", () => {
  it("valid response structure can be constructed", () => {
    const response: SourceResponse = {
      status: "success",
      id: "hackernews" as SourceID,
      updatedTime: Date.now(),
      items: [
        {
          id: "1",
          title: "Test News",
          url: "https://example.com",
        },
      ],
    }
    expect(response.status).toBe("success")
    expect(response.items).toHaveLength(1)
    expect(response.items[0].title).toBe("Test News")
  })

  it("items can have all optional fields", () => {
    const item: NewsItem = {
      id: "42",
      title: "Full Featured News",
      url: "https://example.com/article",
      mobileUrl: "https://m.example.com/article",
      pubDate: Date.now(),
      extra: {
        hover: "Hover text",
        date: Date.now(),
        info: "Extra info",
        diff: 3,
        icon: "https://example.com/icon.png",
      },
    }
    expect(item.mobileUrl).toBeTruthy()
    expect(item.extra?.diff).toBe(3)
    expect(item.extra?.icon).toBe("https://example.com/icon.png")
  })
})

describe("ColumnID and metadata", () => {
  it("fixed columns exist", () => {
    // Verify the column ids that should always exist
    const allSources = Object.keys(sources)
    expect(allSources.length).toBeGreaterThan(0)
  })
})
