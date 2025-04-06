import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"
import { parseRelativeDate } from "../utils/date"

export default defineSource(async () => {
  const response: any = await myFetch("https://www.ithome.com/list/")
  const $ = cheerio.load(response)
  const $main = $("#list > div.fl > ul > li")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a.t")
    const url = $a.attr("href")
    const title = $a.text()
    const date = $(el).find("i").text()
    if (url && title && date) {
      const isAd = url?.includes("lapin") || ["神券", "优惠", "补贴", "京东"].find(k => title.includes(k))
      if (!isAd) {
        news.push({
          url,
          title,
          id: url,
          pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf(),
        })
      }
    }
  })
  return news.sort((m, n) => n.pubDate! > m.pubDate! ? 1 : -1)
})
