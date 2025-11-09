import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.bestblogs.dev/feeds/rss"

  const data = await rss2json(url)

  if (!data || !data.items) {
    return []
  }

  return data.items.slice(0, 30).map((item) => {
    // 提取作者信息
    const author = item.author || "BestBlogs"

    // 从 description 中提取 AI 评分信息（如果有的话）
    let scoreInfo = ""
    if (item.description) {
      const scoreMatch = item.description.match(/评分[：:]\s*(\d+)/)
      if (scoreMatch) {
        scoreInfo = `AI评分: ${scoreMatch[1]}`
      }
    }

    // 提取封面图片（如果有）
    const coverImage = item.enclosures && item.enclosures.length > 0
      ? item.enclosures[0].url || item.enclosures[0]
      : undefined

    const newsItem: NewsItem = {
      id: item.id || item.link,
      title: item.title,
      url: item.link,
      pubDate: item.created ? parseRelativeDate(item.created).valueOf() : undefined,
      extra: {
        info: author,
      },
    }

    // 添加 AI 评分信息（如果有）
    if (scoreInfo) {
      newsItem.extra!.hover = scoreInfo
    }

    // 添加封面图片（如果有）
    if (coverImage) {
      newsItem.extra!.icon = coverImage
    }

    return newsItem
  })
})
