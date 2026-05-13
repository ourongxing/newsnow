import type { NewsItem } from "@shared/types"

interface WPPost {
  id: number
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(Number.parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

export default defineSource(async () => {
  const posts: WPPost[] = await myFetch("https://www.siliconvalley.com/wp-json/wp/v2/posts", {
    query: {
      categories: 16325,
      per_page: 20,
      _fields: "id,date,title,link,excerpt",
    },
  })
  if (!Array.isArray(posts) || posts.length === 0) return []

  const news: NewsItem[] = posts.map((p) => {
    const title = decodeEntities(p.title?.rendered ?? "").trim()
    const excerpt = decodeEntities(p.excerpt?.rendered ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 150)
    return {
      id: String(p.id),
      title,
      url: p.link,
      pubDate: new Date(p.date).getTime(),
      extra: { hover: excerpt },
    }
  })
  return news
})
