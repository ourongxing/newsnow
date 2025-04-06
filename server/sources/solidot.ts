import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"
import { parseRelativeDate } from "../utils/date"

export default defineSource(async () => {
  const baseURL = "https://www.solidot.org"
  const html: any = await myFetch(baseURL)
  const $ = cheerio.load(html)
  const $main = $(".block_m")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el).find(".bg_htit a").last()
    const url = a.attr("href")
    const title = a.text()
    const date_raw = $(el).find(".talk_time").text().match(/发表于(.*?分)/)?.[1]
    const date = date_raw?.replace(/[年月]/g, "-").replace("时", ":").replace(/[分日]/g, "")
    if (url && title && date) {
      news.push({
        url: baseURL + url,
        title,
        id: url,
        pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf(),
      })
    }
  })
  return news
})
