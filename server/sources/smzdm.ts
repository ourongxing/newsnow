import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://post.smzdm.com/hot_1/"
  const html: any = await myFetch(baseURL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      "Cookie": "w_tsfp=ltvuV0MF2utBvS0Q7a/glE2vFDsjdzw4h0wpEaR0f5thQLErU5mB1I96uMr1NHbX4Mxnvd7DsZoyJTLYCJI3dwNGFMSQet8Yjg+Rw4Qi2t0XUxdgGMiND1YbK7MnujVAKHhCNxS00jA8eIUd379yilkMsyN1zap3TO14fstJ019E6KDQmI5uDW3HlFWQRzaLbjcMcuqPr6g18L5a5T7d4Vz9JFshBOgW00GbhCAfDS115RS5dL9VPRqscpz6SqA=",
    },
    timeout: 10000,
    retry: 3,
  })
  const $ = cheerio.load(html)
  const $main = $("#feed-main-list .z-feed-title")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el).find("a")
    const url = a.attr("href")!
    const title = a.text()
    news.push({
      url,
      title,
      id: url,
    })
  })
  return news
})
