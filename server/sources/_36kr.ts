import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import dayjs from "dayjs/esm"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://www.36kr.com/",
}

const quick = defineSource(async () => {
  const baseURL = "https://www.36kr.com"
  const url = `${baseURL}/newsflashes`
  const response = await myFetch(url, { headers: BROWSER_HEADERS }) as any
  const $ = load(response)
  const news: NewsItem[] = []

  // Primary: .newsflash-item
  let $items = $(".newsflash-item")
  // Fallback: look for items containing links to newsflashes
  if (!$items.length) {
    $items = $("a[href*='/newsflashes/']").parent()
  }
  // Fallback: look for any structured list in the main area
  if (!$items.length) {
    $items = $(".main, .layout-main, .container, [class*='newsflash'], [class*='news-flash']").children().filter("div, li, article")
  }

  $items.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a[href*='/newsflashes/']").first().length
      ? $el.find("a[href*='/newsflashes/']").first()
      : $el.find("a").first()
    const url = $a.attr("href")
    const title = $a.text().trim()
    const relativeDate = $el.find(".time").first().text().trim()
      || $el.find("time").attr("datetime")
      || $el.find("[class*='time']").first().text().trim()
    if (url && title) {
      const href = url.startsWith("http") ? url : `${baseURL}${url}`
      if (!news.some(n => n.url === href)) {
        news.push({
          url: href,
          title,
          id: url,
          extra: {
            date: relativeDate ? parseRelativeDate(relativeDate, "Asia/Shanghai").valueOf() : Date.now(),
          },
        })
      }
    }
  })

  return news
})

const renqi = defineSource(async () => {
  const baseURL = "https://36kr.com"
  const formatted = dayjs().format("YYYY-MM-DD")
  const url = `${baseURL}/hot-list/renqi/${formatted}/1`

  const response = await myFetch<any>(url, { headers: BROWSER_HEADERS })
  const $ = load(response)
  const articles: NewsItem[] = []

  // Primary: look for article items with specific classes
  let $items = $(".article-item-info, .hot-list-item, [class*='article-item']")
  // Fallback: look for any list of articles
  if (!$items.length) {
    $items = $("a[href*='/hot-list/']").parent()
  }
  // Fallback: find all links with article-like href patterns
  if (!$items.length) {
    $items = $("a[href*='/p/']").filter((_, el) => {
      return $(el).text().trim().length > 5
    })
  }

  if ($items.length) {
    $items.each((_, el) => {
      const $el = $(el)
      const $a = $el.is("a") ? $el : $el.find("a").first()
      const href = $a.attr("href") || ""
      const title = $a.text().trim()

      if (href && title && title.length > 2) {
        const descEl = $el.find("[class*='description'], [class*='desc'], p").first()
        const description = descEl.text().trim()
        const author = $el.find("[class*='author'], [class*='user']").first().text().trim() || "36氪"
        const hot = $el.find("[class*='hot'], [class*='num'], [class*='count']").first().text().trim()

        if (!articles.some(n => n.url === href || n.title === title)) {
          articles.push({
            url: href.startsWith("http") ? href : `${baseURL}${href}`,
            title,
            id: href.replace(/^https?:\/\/[^\/]+/, ""),
            extra: {
              info: hot ? `${author}  |  ${hot}` : author,
              hover: description || undefined,
            },
          })
        }
      }
    })
  }

  return articles
})

export default defineSource({
  "36kr": quick,
  "36kr-quick": quick,
  "36kr-renqi": renqi,
})
