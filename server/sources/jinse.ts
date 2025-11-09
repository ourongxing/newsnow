import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  // 金色财经快讯 API
  const url = "https://api.jinse.cn/noah/v2/lives"

  try {
    const response: any = await myFetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response || !response.list) {
      return []
    }

    return response.list.slice(0, 30).map((item: any): NewsItem => ({
      id: item.id,
      title: item.content || item.title,
      url: item.link || `https://www.jinse.cn/lives/${item.id}.html`,
      pubDate: (item.created_at || item.published_at) * 1000,
      extra: {
        info: "金色财经",
      },
    }))
  } catch {
    // 如果 API 失败，返回空数组而不是抛出错误
    return []
  }
})
