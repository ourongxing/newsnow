import type { NewsItem } from "@shared/types"

interface AIHotItem {
  id: string
  title: string
  url: string
  permalink?: string
  source: string
  publishedAt?: string | null
  summary?: string | null
  category?: string | null
  score?: number | null
  selected?: boolean | null
}

interface AIHotResponse {
  count?: number
  items?: AIHotItem[]
}

const api = "https://aihot.virxact.com/api/public/items?mode=all&take=30"
const rss = defineRSSSource("https://aihot.virxact.com/feed/all.xml")
const userAgent = "newsnow-aihot-source/1.0 (+https://newsnow.busiyi.world)"

export default defineSource(async () => {
  try {
    const response = await myFetch<AIHotResponse>(api, {
      headers: {
        "User-Agent": userAgent,
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
