interface Article {
  id: string
  url: string
  headline: string
  description: string
  datePublished: string
  flyTitle?: string
}

interface Res {
  articles: Article[]
}

export default defineSource({
  economist: async () => {
    // Using The Economist's RSS feed
    const url = "https://www.economist.com/rss"
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
      const category = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1] || 
                      item.match(/<category>(.*?)<\/category>/)?.[1] || ""
      
      return {
        id: link || `economist-${index}`,
        title: title.trim(),
        url: link,
        extra: {
          info: category || new Date(pubDate).toLocaleDateString(),
          hover: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        },
      }
    })
  },
})