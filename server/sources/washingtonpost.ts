interface Article {
  canonical_url: string
  display_headline: string
  first_publish_date: string
  byline: string
}

interface Res {
  articles: Article[]
}

export default defineSource({
  washingtonpost: async () => {
    // Using Washington Post's RSS feed or public API endpoint
    const url = "https://www.washingtonpost.com/politics/rss/"
    const response = await fetch(url)
    const text = await response.text()
    
    // Parse RSS XML
    const items = text.match(/<item>(.*?)<\/item>/gs) || []
    
    return items.slice(0, 20).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                   item.match(/<title>(.*?)<\/title>/)?.[1] || `Article ${index + 1}`
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ""
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                         item.match(/<description>(.*?)<\/description>/)?.[1] || ""
      
      return {
        id: link || `wp-${index}`,
        title: title.trim(),
        url: link,
        extra: {
          info: new Date(pubDate).toLocaleDateString(),
          hover: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        },
      }
    })
  },
})