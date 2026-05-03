import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://www.freebuf.com/",
}

function extractIdFromUrl(url: string): string {
  const lastPart = url.slice(url.lastIndexOf("/") + 1)
  const match = lastPart.match(/\d+/)
  return match ? match[0] : url
}

function formatUrl(url: string | undefined, baseUrl: string = "https://www.freebuf.com"): string {
  if (!url) return ""
  return url.startsWith("http") ? url : `${baseUrl}${url}`
}

export default defineSource(async () => {
  const baseUrl = "https://www.freebuf.com"
  const html = await myFetch<any>(baseUrl, { headers: BROWSER_HEADERS })
  const $ = cheerio.load(html)
  const articles: NewsItem[] = []

  // Primary: .article-item
  let $items = $(".article-item")
  // Fallback: article tags
  if (!$items.length) {
    $items = $("article")
  }
  // Fallback: any list item with title link
  if (!$items.length) {
    $items = $("a[href*='/articles/']").filter((_, el) => {
      const text = $(el).text().trim()
      return text.length > 5 && text.length < 100
    })
  }

  if ($items.length) {
    $items.each((_, el) => {
      const $el = $(el)

      let title = ""
      let url = ""

      if ($el.is("a")) {
        title = $el.text().trim()
        url = formatUrl($el.attr("href"), baseUrl)
      } else {
        const $titleLink = $el.find(".title-left .title").parent().length
          ? $el.find(".title-left .title").parent()
          : $el.find("a[href*='/articles/'], a[href*='/news/']").first()
        const $titleEl = $titleLink.find(".title").length
          ? $titleLink.find(".title")
          : $titleLink

        title = $titleEl.text().trim() || $titleLink.attr("title") || ""
        url = formatUrl($titleLink.attr("href"), baseUrl)
      }

      if (!title) return

      const description = $el.find(".item-right .text-line-2, [class*='desc'], [class*='summary'], p").first().text().trim()
      const author = $el.find("[class*='author'] span, [class*='user']").last().text().trim()

      articles.push({
        id: extractIdFromUrl(url),
        title,
        url,
        extra: {
          hover: description || undefined,
          info: author || undefined,
        },
      })
    })
  }

  return articles
})
