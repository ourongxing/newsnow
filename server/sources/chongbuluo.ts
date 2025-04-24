import type { NewsItem } from "@shared/types"
import * as cheerio from "cheerio"


export default defineSource(async () => {
  const baseUrl = 'https://www.chongbuluo.com/'
  const html: string = await myFetch(baseUrl + "forum.php?mod=guide&view=hot")
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  $(".bmw table tr").each((i, elem) => {
    let xst = $(elem).find(".common .xst").text()
    let xi1 = $(elem).find(".common .xi1").text()
    if (xst) {
      xst = xst + " " + xi1
    }
    const date = $(elem).find("em span").attr("title")
    const url = $(elem).find(".common a").attr("href")

    console.log(xst)
    console.log(xi1)
    console.log(date)
    console.log(url)
    news.push({
      id: baseUrl + url,
      url: baseUrl + url,
      title: xst,
      extra: {
        hover: xst,
        date: date,
      },
    })
  })

  return news
})
