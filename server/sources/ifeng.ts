import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const html: string = await myFetch("https://www.ifeng.com/")
  const regex = /var\s+allData\s*=\s*(\{[^]*?\});/g;
  const match = regex.exec(html);
  const news: NewsItem[] = []
  if (match) {
    const realData =  JSON.parse(match[1])
    realData.hotNews1.forEach((hotNews, i) => {
      news.push({
        id: hotNews.url,
        url: hotNews.url,
        title: hotNews.title,
        extra: {
          hover: hotNews.title,
          date: hotNews.newsTime,
        },
      })
    })
  }
  return news
})
