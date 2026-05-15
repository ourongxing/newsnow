import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const xml: string = await myFetch("https://aihot.virxact.com/feed.xml", {
    responseType: "text",
  })
  const parser = new XMLParser()
  const result = parser.parse(xml)
  const items = result?.rss?.channel?.item
  if (!Array.isArray(items) || !items.length) return []

  return items.map((item: any): NewsItem => {
    const desc = typeof item.description === "string"
      ? item.description.replace(/<[^>]*>/g, "").trim()
      : ""
    return {
      id: String(item.link ?? item.guid ?? item.title),
      title: String(item.title ?? "").trim(),
      url: String(item.link ?? ""),
      pubDate: item.pubDate,
      ...(desc ? { extra: { hover: desc.slice(0, 200) } } : {}),
    }
  })
})
