import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

export default defineSource(async () => {
  const baseURL = "https://www.producthunt.com"
  const html: any = await myFetch(baseURL)
  const $ = cheerio.load(html)
  const $main = $("[data-test=homepage-section-0] [data-test^=post-item]")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el).find("a").first()
    const url = a.attr("href")
    const title = $(el).find("a[data-test^=post-name]").text().replace(/^\d+\.\s*/, "")
    const id = $(el).attr("data-test")?.replace("post-item-", "")
    const vote = $(el).find("[data-test=vote-button]").text()
    if (url && id && title) {
      news.push({
        url: `${baseURL}${url}`,
        title,
        id,
        extra: {
          info: `△︎ ${vote}`,
        },
      })
    }
  })
  return news
})
