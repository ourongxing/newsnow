import type { NewsItem } from "@shared/types.ts"

import dayjs from "dayjs/esm"
import * as cheerio from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

/**
 * 腾讯视频-动漫-今日更新
 */
const qqCartoon = defineSource(async () => {
  const url = "https://v.qq.com/channel/cartoon"
  const html: string = await myFetch<string>(url, { headers: { Referer: "https://v.qq.com/" } })

  // 1. 提取 window.__vikor__context__
  const data = extractVikorJson(html)
  const pinia = typeof data?._piniaState === "object" && data._piniaState !== null ? data._piniaState : {}

  // 2. 找到「每日更新」模块
  const daily = findDailyCard(pinia)
  if (!daily) {
    console.warn("未找到“每日更新”模块，返回空结果。")
    return []
  }

  // 3. 提取今日更新视频
  const tabId: string = daily.selectedTabId ?? ""
  const todayVideos: any[] = daily.videoBannerMap?.[tabId]?.videoList ?? []

  return todayVideos.map(buildNewsItem).filter((v): v is NewsItem => v !== null)
})

function extractVikorJson(html: string): any {
  const $ = cheerio.load(html)

  let scriptText: string | undefined

  $("script").each((_, el) => {
    const text = $(el).html()
    if (text && text.includes("window.__vikor__context__")) {
      scriptText = text
      return false
    }
  })

  if (!scriptText) {
    console.warn("未找到包含 window.__vikor__context__ 的 <script> 标签")
    throw new Error("window.__vikor__context__ not found")
  }

  const prefix = "window.__vikor__context__="
  const idx = scriptText.indexOf(prefix)
  if (idx === -1) {
    throw new Error("脚本内容格式不正确，无法提取 JSON")
  }

  let rawJson = scriptText.slice(idx + prefix.length)
  rawJson = rawJson.replace(/;$/, "")

  // JS → JSON 修正
  rawJson = rawJson.replace(/\bundefined\b/g, "null")

  return JSON.parse(rawJson)
}

function findDailyCard(pinia: any): any | null {
  const cards: any[] = pinia?.channelPageData?.channelsModulesMap?.["100119"]?.cardListData ?? []

  return cards.find(c => c?.moduleTitle === "每日更新") ?? null
}

function buildNewsItem(item: any): NewsItem | null {
  const title = (item?.title ?? "").trim()
  if (!title) return null

  // uniImgTag 是 JSON 字符串
  let updateCount = ""
  try {
    const uniImg = item?.uniImgTag
    const obj = JSON.parse(uniImg)
    const text = obj?.tag_4?.text ?? ""
    const num = extractNumber(text)
    if (num === null) return null
    updateCount = String(num)
  } catch {
    return null
  }

  const updateCountInfo = `更新至${updateCount}集`
  const topicLabel = (item?.topicLabel ?? "").trim()
  const updateInfo = `${updateCountInfo} ${topicLabel}`

  // const imageUrl = (item?.coverPic ?? "").trim();
  const cid = item?.cid ?? ""
  const detailUrl = getQqVideoUrl(cid)

  return {
    id: item?.id,
    title,
    url: detailUrl,
    pubDate: getTodaySlash(),
    extra: {
      info: updateInfo,
      hover: item?.subTitle,
    },
  }
}

function extractNumber(text: string): number | null {
  const m = text.match(/\d+/)
  return m ? Number(m[0]) : null
}

function getQqVideoUrl(cid: string): string {
  return `https://v.qq.com/x/cover/${cid}.html`
}

function getTodaySlash(): string {
  return dayjs().format("YYYY/MM/DD")
}

export default defineSource({
  "qqVideo-cartoon": qqCartoon,
})
