import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const quick = defineSource(async () => {
  const baseURL = "https://gamebiz.jp"
  const url = `${baseURL}/news`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []

  $(".article--horizontal").each((_, element) => {
    const title = $(element).find(".article__title").text().trim()
    const linkElement = $(element).find("a.article__link")
    const link = linkElement.attr("href")
    const category = $(element).find(".article__category").text().trim()
    const publishedAt = $(element).find(".article__published-at").text().trim()

    if (title && link) {
      console.log(`Original link: ${link}`)
      console.log(`Link starts with http: ${link.startsWith("http")}`)
      console.log(`Link starts with /: ${link.startsWith("/")}`)
      
      let fullLink = link
      if (!link.startsWith("http")) {
        fullLink = `${baseURL}${link.startsWith("/") ? link : `/${link}`}`
      }
      
      console.log(`Final link: ${fullLink}`)
      
      news.push({
        id: link,
        title,
        url: fullLink,
        pubDate: publishedAt,
        extra: {
          info: category
        }
      })
    } else {
      console.log(`Missing link for title: ${title}`)
    }
  })

  return news
})

export default defineSource({
  "gamebiz": quick,
  "gamebiz-quick": quick,
}) 