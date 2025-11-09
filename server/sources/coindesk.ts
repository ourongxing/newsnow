import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.coindesk.com/arc/outboundfeeds/rss/"

  const data = await rss2json(url)

  if (!data || !data.items) {
    return []
  }

  return data.items.slice(0, 30).map((item): NewsItem => ({
    id: item.id || item.link,
    title: item.title,
    url: item.link,
    pubDate: item.created ? parseRelativeDate(item.created).valueOf() : undefined,
    extra: {
      info: "CoinDesk",
    },
  }))
})
