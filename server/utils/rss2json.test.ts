import { describe, expect, it, vi } from "vitest"
import { rss2json } from "./rss2json"
import { myFetch } from "./fetch"

// Mock myFetch
vi.mock("./fetch", () => ({
  myFetch: vi.fn(),
}))

describe("rss2json", () => {
  it("should handle Atom feed with multiple links", async () => {
    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Feed</title>
  <link href="http://example.org/feed/" rel="self" />
  <link href="http://example.org/" />
  <updated>2003-12-13T18:30:02Z</updated>
  <author>
    <name>John Doe</name>
  </author>
  <id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>
  <entry>
    <title>Atom-Powered Robots Run Amok</title>
    <link href="http://example.org/2003/12/13/atom03" />
    <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
    <updated>2003-12-13T18:30:02Z</updated>
    <summary>Some text.</summary>
  </entry>
</feed>`

    vi.mocked(myFetch).mockResolvedValue(atomXml)

    const result = await rss2json("http://example.org/feed")
    expect(result).toBeDefined()
    // This expects a string
    expect(typeof result?.link).toBe("string")
    expect(result?.link).toBe("http://example.org/")

    // Check item link
    expect(result?.items.length).toBe(1)
    expect(typeof result?.items[0].link).toBe("string")
    expect(result?.items[0].link).toBe("http://example.org/2003/12/13/atom03")
  })

  it("should prioritize alternate link or no-rel link", async () => {
      const atomXml = `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>Test Feed</title>
    <link href="http://example.org/feed/" rel="self" />
    <link href="http://example.org/alternate" rel="alternate" />
    <updated>2003-12-13T18:30:02Z</updated>
    <entry>
      <title>Test</title>
      <link href="http://example.org/entry/self" rel="self" />
      <link href="http://example.org/entry/alternate" rel="alternate" />
      <updated>2003-12-13T18:30:02Z</updated>
    </entry>
  </feed>`

      vi.mocked(myFetch).mockResolvedValue(atomXml)

      const result = await rss2json("http://example.org/feed")
      expect(result).toBeDefined()
      expect(result?.link).toBe("http://example.org/alternate")
      expect(result?.items[0].link).toBe("http://example.org/entry/alternate")
    })
})
