import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://www.fastbull.com/",
}

const express = defineSource(async () => {
  const baseURL = "https://www.fastbull.com"
  const html: any = await myFetch(`${baseURL}/cn/express-news`, { headers: BROWSER_HEADERS })
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Primary: .news-list
  let $main = $(".news-list")
  // Fallback: look for items with data-date attribute
  if (!$main.length) {
    $main = $("[data-date]").parent()
  }
  // Fallback: any list items in main content
  if (!$main.length) {
    $main = $(".main, .content, .list, [class*='news']").children("div, li").filter((_, el) => {
      return $(el).find("a").length > 0
    })
  }

  $main.each((_, el) => {
    const $el = $(el)
    const a = $el.find(".title_name, [class*='title'], a").first()
    const url = a.attr("href")
    const titleText = a.text().trim()
    const title = titleText.match(/【(.+)】/)?.[1] ?? titleText
    const date = $el.attr("data-date") || $el.find("[data-date]").attr("data-date") || $el.find("time").attr("datetime")

    if (url && title && date) {
      news.push({
        url: url.startsWith("http") ? url : baseURL + url,
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
  const html: any = await myFetch(`${baseURL}/cn/news`, { headers: BROWSER_HEADERS })
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Primary: .trending_type
  let $main = $(".trending_type")
  // Fallback: find links in main content with title
  if (!$main.length) {
    $main = $("[class*='trending'], [class*='news-item'], .main a, article")
  }

  $main.each((_, el) => {
    const $el = $(el)
    const a = $el.is("a") ? $el : $el.find("a").first()
    const url = a.attr("href")
    const title = a.find(".title, [class*='title']").text().trim() || a.text().trim()
    const date = $el.find("[data-date]").attr("data-date") || $el.attr("data-date")

    if (url && title && date) {
      news.push({
        url: url.startsWith("http") ? url : baseURL + url,
        title,
        id: url,
        pubDate: Number(date),
      })
    }
  })

  return news
})

export default defineSource({
  "fastbull": express,
  "fastbull-express": express,
  "fastbull-news": news,
})
