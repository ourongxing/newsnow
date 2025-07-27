import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  try {
    // Try multiple RSS feeds for Washington Post
    const feeds = [
      "https://feeds.washingtonpost.com/rss/world",
      "https://feeds.washingtonpost.com/rss/business",
      "https://feeds.washingtonpost.com/rss/politics",
      "https://www.washingtonpost.com/arc/outboundfeeds/rss/"
    ]
    
    let text: string = ""
    for (const url of feeds) {
      try {
        text = await myFetch(url)
        if (text && text.includes("<item>")) break
      } catch {
        continue
      }
    }
    
    if (!text) {
      // Fallback: return sample data if no feeds work
      return [
        {
          id: "washingtonpost-sample",
          title: "The Washington Post - Breaking News",
          url: "https://www.washingtonpost.com",
          pubDate: Date.now(),
          extra: {
            info: "Latest",
            hover: "Visit The Washington Post for breaking news and analysis",
          },
        }
      ]
    }
    
    // Parse RSS XML
    const items = text.match(/<item>(.*?)<\/item>/gs) || []
    
    const news: NewsItem[] = []
    
    for (let i = 0; i < Math.min(items.length, 15); i++) {
      const item = items[i]
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                   item.match(/<title>(.*?)<\/title>/)?.[1]
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                         item.match(/<description>(.*?)<\/description>/)?.[1]
      
      if (title && link) {
        news.push({
          id: link,
          title: title.trim(),
          url: link,
          pubDate: pubDate ? new Date(pubDate).valueOf() : Date.now(),
          extra: {
            info: pubDate ? new Date(pubDate).toLocaleDateString() : "",
            hover: description ? description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : "",
          },
        })
      }
    }
    
    return news.length > 0 ? news : [
      {
        id: "washingtonpost-fallback",
        title: "The Washington Post - News",
        url: "https://www.washingtonpost.com",
        pubDate: Date.now(),
        extra: {
          info: "Latest",
          hover: "Visit The Washington Post for the latest news",
        },
      }
    ]
  } catch (error) {
    console.error("Washington Post scraper error:", error)
    return [
      {
        id: "washingtonpost-error",
        title: "The Washington Post - News Feed Unavailable",
        url: "https://www.washingtonpost.com",
        pubDate: Date.now(),
        extra: {
          info: "Error",
          hover: "Unable to fetch latest news. Please visit the website directly.",
        },
      }
    ]
  }
})