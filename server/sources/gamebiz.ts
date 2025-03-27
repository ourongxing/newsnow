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
    const link = $(element).find("a.article__link").attr("href")
    const category = $(element).find(".article__category").text().trim()
    const publishedAt = $(element).find(".article__published-at").text().trim()

    if (title && link) {
      const fullLink = link.startsWith("http") ? link : `${baseURL}${link}`
      news.push({
        title,
        link: fullLink,
        category,
        publishedAt,
      })
    }
  })

  return news
})

export default defineSource({
  "gamebiz": quick,
  "gamebiz-quick": quick,
}) 