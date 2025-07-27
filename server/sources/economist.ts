import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  try {
    // Since RSS feeds are blocked, try scraping the main page
    const html: string = await myFetch("https://www.economist.com")
    const $ = cheerio.load(html)
    
    const news: NewsItem[] = []
    
    // Try different selectors for articles
    const selectors = [
      'article[data-component="ArticleTeaser"]',
      '.css-1wjnrbv', 
      '[data-component="ArticleTeaser"]',
      'article h3 a',
      '.headline a'
    ]
    
    for (const selector of selectors) {
      const $articles = $(selector)
      if ($articles.length > 0) {
        $articles.slice(0, 15).each((i, el) => {
          const $el = $(el)
          let title = ""
          let url = ""
          
          if ($el.is('a')) {
            title = $el.text().trim()
            url = $el.attr('href') || ""
          } else {
            const $link = $el.find('a').first()
            title = $link.text().trim() || $el.find('h3').text().trim() || $el.find('.headline').text().trim()
            url = $link.attr('href') || ""
          }
          
          if (title && url && title.length > 10) {
            // Ensure URL is absolute
            if (url.startsWith('/')) {
              url = `https://www.economist.com${url}`
            }
            
            news.push({
              id: url,
              title: title.substring(0, 200), // Limit title length
              url: url,
              pubDate: Date.now(),
              extra: {
                info: "Latest",
                hover: title.length > 100 ? title.substring(0, 150) + '...' : title,
              },
            })
          }
        })
        
        if (news.length > 0) break // If we found articles, stop trying other selectors
      }
    }
    
    // If scraping failed, return fallback content
    if (news.length === 0) {
      return [
        {
          id: "economist-fallback-1",
          title: "The Economist - International News & Analysis",
          url: "https://www.economist.com/international",
          pubDate: Date.now(),
          extra: {
            info: "International",
            hover: "Global news and analysis from The Economist",
          },
        },
        {
          id: "economist-fallback-2", 
          title: "The Economist - Business & Finance",
          url: "https://www.economist.com/business",
          pubDate: Date.now(),
          extra: {
            info: "Business",
            hover: "Business and finance coverage from The Economist",
          },
        },
        {
          id: "economist-fallback-3",
          title: "The Economist - The World in Brief",
          url: "https://www.economist.com/the-world-in-brief",
          pubDate: Date.now(),
          extra: {
            info: "World Brief",
            hover: "Daily briefing on global events from The Economist",
          },
        }
      ]
    }
    
    return news
  } catch (error) {
    console.error("Economist scraper error:", error)
    return [
      {
        id: "economist-error",
        title: "The Economist - Visit Website",
        url: "https://www.economist.com",
        pubDate: Date.now(),
        extra: {
          info: "Error",
          hover: "Unable to fetch latest news. Click to visit The Economist website.",
        },
      }
    ]
  }
})