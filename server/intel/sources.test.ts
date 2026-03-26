import { describe, expect, it, vi } from "vitest"

import { fetchConfiguredSources } from "./sources"

vi.mock("../getters", () => ({
  sourcesGetters: {
    "hackernews": vi.fn(async () => [
      { id: "1", title: "HN Article", url: "https://hn.com/1" },
    ]),
    "github-trending-today": vi.fn(async () => [
      { id: "2", title: "GH Trending", url: "https://gh.com/2" },
    ]),
  },
}))

describe("fetchConfiguredSources", () => {
  it("fetches and tags items with source_id", async () => {
    const result = await fetchConfiguredSources(["hackernews", "github-trending-today"])
    expect(result).toHaveLength(2)
    expect(result[0]._sourceId).toBe("hackernews")
  })

  it("skips failing sources gracefully", async () => {
    const result = await fetchConfiguredSources(["hackernews", "nonexistent"])
    expect(result).toHaveLength(1)
  })
})
