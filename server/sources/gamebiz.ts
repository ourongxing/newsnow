import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const quick = defineSource(async () => {
  const baseURL = "https://gamebiz.jp"
  const url = `${baseURL}/news` 
  const response = await myFetch(url) as any
  console.log("Response received:", response) // 调试输出
  const $ = load(response)
  const news: NewsItem[] = []
  
  // 选择新闻列表项
  const $items = $(".news-list .news-item")
  console.log("Number of news items found:", $items.length) // 调试输出
  
  $items.each((_, el) => {
    const $el = $(el)
    const $link = $el.find(".news-title a")
    const url = $link.attr("href")
    const title = $link.text().trim()
    
    // 获取分类和时间
    const category = $el.find(".news-category").text().trim()
    const dateStr = $el.find(".news-date").text().trim()
    console.log("Parsed item:", { url, title, category, dateStr }) // 调试输出
    
    if (url && title && dateStr) {
      news.push({
        url: url.startsWith("http") ? url : `${baseURL}${url}`,
        title,
        id: url,
        extra: {
          category,
          date: parseRelativeDate(dateStr, "Asia/Tokyo").valueOf(),
        },
      })
    }
  })

  return news
})

export default defineSource({
  "gamebiz": quick,
  "gamebiz-quick": quick,
}) 