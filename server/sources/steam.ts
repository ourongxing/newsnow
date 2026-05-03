import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const response: any = await myFetch("https://store.steampowered.com/stats/stats/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
  })
  const $ = cheerio.load(response)
  const $rows = $("#detailStats tr.player_count_row")
  const news: NewsItem[] = []

  $rows.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a.gameLink")
    const url = $a.attr("href")
    const gameName = $a.text().trim()
    const currentPlayers = $el.find("td:first-child .currentServers").text().trim()

    if (url && gameName && currentPlayers) {
      const title = gameName
      news.push({
        url,
        title,
        id: url,
        pubDate: Date.now(),
        extra: {
          info: `当前玩家: ${currentPlayers}`,
        },
      })
    }
  })

  return news
})
