import type { NewsItem } from "@shared/types"

import dayjs from "dayjs/esm"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

/**
 * 优酷动漫 - 追番表
 */
const webcomicToday = defineSource(async () => {
  const url = "https://www.youku.com/ku/webcomic"
  const html = await myFetch<string>(url, {
    headers: { Referer: "https://www.youku.com/ku/webhome" },
  })

  const data = extractInitialData(html)

  const modules = data?.moduleList

  if (!Array.isArray(modules)) {
    return []
  }

  return extractTodayAnime(modules)
})

/* ------------------------ core logic ------------------------ */

function extractTodayAnime(modules: any[]): NewsItem[] {
  const animeModule = modules.find(m => m?.type === 13901)
  if (!animeModule) return []

  const components = animeModule.components
  if (!Array.isArray(components)) return []

  const dailyUpdate = components.find(c => c?.title === "每日更新")
  if (!dailyUpdate) return []

  const itemList = dailyUpdate.itemList
  if (!Array.isArray(itemList)) return []

  const todayIndex = getIsoWeekdayIndex()
  const todayItems = itemList[todayIndex]

  if (!Array.isArray(todayItems)) return []

  return todayItems.map(buildAniItem)
}

/* ------------------------ helpers ------------------------ */

function extractInitialData(html: string): any {
  const marker = "window.__INITIAL_DATA__"
  const idx = html.indexOf(marker)
  if (idx === -1) throw new Error("未找到 __INITIAL_DATA__")

  const start = html.indexOf("=", idx)
  const jsonStart = html.indexOf("{", start)

  let depth = 0
  let end = jsonStart

  for (; end < html.length; end++) {
    if (html[end] === "{") {
      depth++
    } else if (html[end] === "}" && --depth === 0) {
      end++
      break
    }
  }

  const raw = html.slice(jsonStart, end)
  return JSON.parse(raw.replace(/undefined/g, "null"))
}

function buildAniItem(item: any): NewsItem {
  return {
    id: item?.id ?? "",
    title: (item?.title ?? "").trim(),
    url: getYoukuVideoUrl(item),
    pubDate: getTodaySlash(),
    extra: {
      info: [item?.desc, item?.lbTexts].filter(Boolean).join(" "),
      hover: item?.subtitle ?? "",
      coverImg: (item?.img ?? "").trim(),
    },
  } as NewsItem
}

function getIsoWeekdayIndex(): number {
  return (dayjs().day() || 7) - 1
}

function getTodaySlash(): string {
  return dayjs().format("YYYY-MM-DD")
}

function getYoukuVideoUrl(item: any): string {
  const { action_value, scm, scg_id } = item ?? {}
  if (!action_value) return "https://www.youku.com/ku/webcomic"

  const params = new URLSearchParams({
    s: action_value,
    scm,
    scg_id,
  })

  return `https://v.youku.com/video?${params.toString()}`
}

export default defineSource({
  "youku-webcomic-today": webcomicToday,
})
