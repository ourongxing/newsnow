import { load } from "cheerio"

export default defineSource(async () => {
  const baseURL = "https://kaopu.news"
  const html: any = await myFetch(baseURL)
  const $ = load(html)
  return $("article").map((_, el) => {
    const title = $(el).find("h2").text().trim()
    const summary = $(el).find("p").text().trim()
    const time = $(el).find(".story-meta span").first().text().trim()
    if (!title) return null
    return {
      id: title,
      title,
      url: baseURL,
      extra: {
        hover: summary,
        info: time,
      },
    }
  }).get().filter(Boolean)
})
