import type { NewsItem } from "@shared/types"

interface AIHotItem {
  id: string
  title: string
  url: string
  source: string
  publishedAt?: string | null
  summary?: string | null
  category?: string | null
}

interface AIHotResponse {
  items?: AIHotItem[]
}

const rss = defineRSSSource("https://aihot.virxact.com/feed/all.xml")

export default defineSource(async () => {
  try {
    const response = await myFetch<AIHotResponse>("https://aihot.virxact.com/api/public/items?mode=all&take=30", {
      headers: {
        "User-Agent": "aihot-api-demo/1.0 (+https://example.com/contact)",
      },
    })

    const items = response.items?.filter(item => item.id && item.title && item.url) ?? []
    if (!items.length) return rss()

    return items.map<NewsItem>(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      pubDate: item.publishedAt ?? undefined,
      extra: {
        hover: item.summary ?? undefined,
        info: item.category ? `${item.source} · ${item.category}` : item.source,
      },
    }))
  } catch {
    return rss()
  }
})
