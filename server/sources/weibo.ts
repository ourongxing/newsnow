import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseurl = "https://s.weibo.com"
  const url = `${baseurl}/top/summary?cate=realtimehot`

  const html = await myFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Cookie": "SUB=_2AkMWIuNSf8NxqwJRmP8dy2rhaoV2ygrEieKgfhKJJRMxHRl-yT9jqk86tRB6PaLNvQZR6zYUcYVT1zSjoSreQHidcUq7",
      "referer": url,
    },
  })

  const $ = cheerio.load(html)
  const rows = $("#pl_top_realtimehot table tbody tr").slice(1)
  const hotNews: NewsItem[] = []

  rows.each((_, row) => {
    const $row = $(row)
    const $link = $row.find("td.td-02 a").filter((_, el) => {
      const href = $(el).attr("href")
      return !!(href && !href.includes("javascript:void(0);"))
    }).first()

    if ($link.length) {
      const title = $link.text().trim()
      const href = $link.attr("href")

      if (title && href) {
        // 热度值，可能带分类前缀如 "综艺 850468" 或纯数字 "2779657"
        const raw = $row.find("td.td-02 span").text().trim()
        // 解析数字和分类
        const match = raw.match(/^(?:(\D+)\s*)?(\d+)$/)
        const category = match?.[1]?.trim() || ""
        const heatNum = match?.[2] || ""
        // 格式化热度：万单位显示
        const heatDisplay = heatNum
          ? (Number(heatNum) >= 10000
              ? `${(Number(heatNum) / 10000).toFixed(1).replace(/\.0$/, "")}万`
              : heatNum)
          : ""
        const info = [category, heatDisplay ? `${heatDisplay}热度` : ""].filter(Boolean).join(" ")

        // 标签：新/热/爆
        const $flag = $row.find("td.td-03").text().trim()
        const flagUrl = {
          新: "https://simg.s.weibo.com/moter/flags/1_0.png",
          热: "https://simg.s.weibo.com/moter/flags/2_0.png",
          爆: "https://simg.s.weibo.com/moter/flags/4_0.png",
        }[$flag]

        hotNews.push({
          id: title,
          title,
          url: `${baseurl}${href}`,
          mobileUrl: `${baseurl}${href}`,
          extra: {
            icon: flagUrl ? { url: flagUrl, scale: 1.5 } : undefined,
            info: info || undefined,
          },
        })
      }
    }
  })

  return hotNews
})
