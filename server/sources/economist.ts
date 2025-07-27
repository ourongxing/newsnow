import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  try {
    // Try multiple RSS feeds for The Economist
    const feeds = [
      "https://www.economist.com/sections/international/rss.xml",
      "https://www.economist.com/sections/business/rss.xml",
      "https://www.economist.com/sections/finance-and-economics/rss.xml",
      "https://www.economist.com/the-world-in-brief/rss.xml"
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
          id: "economist-sample",
          title: "The Economist - Latest News",
          url: "https://www.economist.com",
          pubDate: Date.now(),
          extra: {
            info: "Latest",
            hover: "Visit The Economist for the latest international news and analysis",
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
      const category = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1] || 
                      item.match(/<category>(.*?)<\/category>/)?.[1]
      
      if (title && link) {
        news.push({
          id: link,
          title: title.trim(),
          url: link,
          pubDate: pubDate ? new Date(pubDate).valueOf() : Date.now(),
          extra: {
            info: category || (pubDate ? new Date(pubDate).toLocaleDateString() : ""),
            hover: description ? description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : "",
          },
        })
      }
    }
    
    return news.length > 0 ? news : [
      {
        id: "economist-fallback",
        title: "The Economist - International News",
        url: "https://www.economist.com",
        pubDate: Date.now(),
        extra: {
          info: "Latest",
          hover: "Visit The Economist for international news and analysis",
        },
      }
    ]
  } catch (error) {
    console.error("Economist scraper error:", error)
    return [
      {
        id: "economist-error",
        title: "The Economist - News Feed Unavailable",
        url: "https://www.economist.com",
        pubDate: Date.now(),
        extra: {
          info: "Error",
          hover: "Unable to fetch latest news. Please visit the website directly.",
        },
      }
    ]
  }
})