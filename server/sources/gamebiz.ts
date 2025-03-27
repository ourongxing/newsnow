import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

async function translateToChinese(text: string): Promise<string> {
  try {
    const response = await myFetch("https://translate.googleapis.com/translate_a/single", {
      params: {
        client: "gtx",
        sl: "ja",
        tl: "zh-CN",
        dt: "t",
        q: text
      }
    })
    return response[0][0][0]
  } catch (error) {
    console.error("Translation error:", error)
    return text
  }
}

const quick = defineSource(async () => {
  const baseURL = "https://gamebiz.jp"
  const url = `${baseURL}/news`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []

  for (const element of $(".article--horizontal").toArray()) {
    const title = $(element).find(".article__title").text().trim()
    const linkElement = $(element).find("a.article__link")
    const link = linkElement.attr("href")
    const category = $(element).find(".article__category").text().trim()
    const publishedAt = $(element).find(".article__published-at").text().trim()

    if (title && link) {
      console.log(`Original link: ${link}`)
      console.log(`Link starts with http: ${link.startsWith("http")}`)
      console.log(`Link starts with /: ${link.startsWith("/")}`)
      
      let fullLink = link
      if (!link.startsWith("http")) {
        fullLink = `${baseURL}${link.startsWith("/") ? link : `/${link}`}`
      }
      
      console.log(`Final link: ${fullLink}`)
      
      // 翻译标题
      const translatedTitle = await translateToChinese(title)
      
      news.push({
        id: link,
        title: translatedTitle,
        url: fullLink,
        pubDate: publishedAt,
        extra: {
          info: category,
          hover: title // 添加原始日文标题作为悬停提示
        }
      })
    } else {
      console.log(`Missing link for title: ${title}`)
    }
  }

  return news
})

export default defineSource({
  "gamebiz": quick,
  "gamebiz-quick": quick,
}) 