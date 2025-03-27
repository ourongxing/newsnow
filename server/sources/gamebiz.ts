import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const quick = defineSource(async () => {
  const baseURL = "https://gamebiz.jp"
  const url = `${baseURL}/news`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []

  $(".article--vertical").each((_, element) => {
    const titleElement = $(element).find(".article__title")
    const linkElement = $(element).find("a.article__link")
    const categoryElement = $(element).find(".article__category")
    const dateElement = $(element).find(".article__published-at")

    const title = titleElement.text().trim()
    const link = linkElement.attr("href")
    const category = categoryElement.text().trim()
    const date = dateElement.text().trim()

    if (title && link) {
      news.push({
        title,
        link: link.startsWith("http") ? link : `${baseURL}${link}`,
        category,
        date,
      })
    }
  })

  return news
})

export default defineSource({
  "gamebiz": quick,
  "gamebiz-quick": quick,
}) 