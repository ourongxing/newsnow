import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const quick = defineSource(async () => {
  const baseURL = "https://www.36kr.com"
  const url = `${baseURL}/newsflashes`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []
  const $items = $(".newsflash-item")
  $items.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a.item-title")
    const url = $a.attr("href")
    const title = $a.text()
    const relativeDate = $el.find(".time").text()
    if (url && title && relativeDate) {
      news.push({
        url: `${baseURL}${url}`,
        title,
        id: url,
        extra: {
          date: parseRelativeDate(relativeDate, "Asia/Shanghai").valueOf(),
        },
      })
    }
  })

  return news
})

interface HotRankItem {
  itemId: number
  templateMaterial: {
    widgetTitle: string
    authorName: string
    statRead: number
    statFormat: string
    publishTime: number
  }
}

const renqi = defineSource(async () => {
  const url = "https://gateway.36kr.com/api/mis/nav/home/nav/rank/hot"
  const response = await myFetch<{ code: number, data: { hotRankList: HotRankItem[] } }>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      partner_id: "web",
      param: { siteId: 1, platformId: 2 },
    }),
  })

  return response.data.hotRankList.map(item => ({
    url: `https://36kr.com/p/${item.itemId}`,
    title: item.templateMaterial.widgetTitle,
    id: item.itemId,
    extra: {
      info: `${item.templateMaterial.authorName}  |  ${item.templateMaterial.statFormat}`,
      date: item.templateMaterial.publishTime,
    },
  }))
})

export default defineSource({
  "36kr": quick,
  "36kr-quick": quick,
  "36kr-renqi": renqi,
})
