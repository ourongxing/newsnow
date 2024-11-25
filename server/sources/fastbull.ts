import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const express = defineSource(async () => {
  const baseURL = "https://www.fastbull.com"
  const html: any = await myFetch(`${baseURL}/cn/express-news`)
  const $ = cheerio.load(html)
  const $main = $(".news-list")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el).find(".title_name")
    const url = a.attr("href")
    const titleText = a.text()
    const title = titleText.match(/【(.+)】/)?.[1] ?? titleText
    const date = $(el).attr("data-date")
    if (url && title && date) {
      news.push({
        url: baseURL + url,
        title: title.length < 4 ? titleText : title,
        id: url,
        pubDate: Number(date),
      })
    }
  })
  return news
})

const news = defineSource(async () => {
  const baseURL = "https://www.fastbull.com"
  const html: any = await myFetch(`${baseURL}/cn/news`)
  const $ = cheerio.load(html)
  const $main = $(".trending_type")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el)
    const url = a.attr("href")
    const title = a.find(".title").text()
    const date = a.find("[data-date]").attr("data-date")
    if (url && title && date) {
      news.push({
        url: baseURL + url,
        title,
        id: url,
        pubDate: Number(date),
      })
    }
  })
  return news
})

export default defineSource(
  {
    "fastbull": express,
    "fastbull-express": express,
    "fastbull-news": news,
  },
)
