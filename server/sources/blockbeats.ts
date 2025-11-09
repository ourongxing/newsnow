import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  // BlockBeats 新闻列表 API
  const url = "https://www.theblockbeats.info/api/v1/articles"

  try {
    const response: any = await myFetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    const data = response.data || response

    if (!data || !Array.isArray(data)) {
      return []
    }

    return data.slice(0, 30).map((item: any): NewsItem => ({
      id: item.id,
      title: item.title,
      url: item.url || `https://www.theblockbeats.info/news/${item.id}`,
      pubDate: item.published_at
        ? new Date(item.published_at).valueOf()
        : item.created_at
          ? new Date(item.created_at).valueOf()
          : undefined,
      extra: {
        info: "BlockBeats",
      },
    }))
  } catch {
    // 如果 API 失败，返回空数组而不是抛出错误
    return []
  }
})
