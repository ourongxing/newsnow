import { describe, expect, it, vi, beforeEach } from "vitest"

// Mock ofetch before any imports
vi.mock("ofetch", () => {
  const mockFetch = vi.fn()
  return {
    $fetch: {
      create: () => mockFetch,
    },
    mockFetch, // export for test access
  }
})

import { rss2json } from "./rss2json"

// Get the mock fetch function
const { $fetch } = await vi.importMock("ofetch")
const mockMyFetch = $fetch.create()

describe("rss2json", () => {
  beforeEach(() => {
    mockMyFetch.mockReset()
  })

  it("returns undefined for invalid URL", async () => {
    const result = await rss2json("not-a-url")
    expect(result).toBeUndefined()
  })

  it("parses RSS 2.0 XML", async () => {
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <description>A test feed</description>
    <link>https://example.com</link>
    <lastBuildDate>Mon, 01 Jan 2024 00:00:00 GMT</lastBuildDate>
    <item>
      <title>Test Article</title>
      <link>https://example.com/article1</link>
      <guid>https://example.com/article1</guid>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <description>Article description</description>
    </item>
  </channel>
</rss>`
    mockMyFetch.mockResolvedValue(rssXml)
    const result = await rss2json("https://example.com/feed.xml")
    expect(result).toBeDefined()
    expect(result!.title).toBe("Test Feed")
    expect(result!.items).toHaveLength(1)
    expect(result!.items[0].title).toBe("Test Article")
    expect(result!.items[0].link).toBe("https://example.com/article1")
  })

  it("parses Atom feed format", async () => {
    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <link href="https://example.com"/>
  <updated>2024-01-01T00:00:00Z</updated>
  <entry>
    <title>Atom Article</title>
    <link href="https://example.com/atom1"/>
    <id>https://example.com/atom1</id>
    <updated>2024-01-01T00:00:00Z</updated>
  </entry>
</feed>`
    mockMyFetch.mockResolvedValue(atomXml)
    const result = await rss2json("https://example.com/atom.xml")
    expect(result).toBeDefined()
    expect(result!.title).toBe("Atom Feed")
    expect(result!.items).toHaveLength(1)
    expect(result!.items[0].title).toBe("Atom Article")
  })

  it("handles empty feed", async () => {
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty Feed</title>
    <description>No items</description>
    <link>https://example.com</link>
  </channel>
</rss>`
    mockMyFetch.mockResolvedValue(rssXml)
    const result = await rss2json("https://example.com/empty.xml")
    expect(result).toBeDefined()
    expect(result!.items).toEqual([])
  })
})
