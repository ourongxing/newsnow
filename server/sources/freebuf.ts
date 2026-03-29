import { execSync } from "node:child_process"
import { XMLParser } from "fast-xml-parser"

export default defineSource(async () => {
  let xml: string
  try {
    xml = execSync("curl -s --max-time 10 \"https://www.freebuf.com/feed\"", { encoding: "utf8" })
  } catch {
    return []
  }

  const parser = new XMLParser()
  const result = parser.parse(xml)
  const items = result?.rss?.channel?.item || []
  if (!Array.isArray(items) || !items.length) return []

  return items.map((item: any) => ({
    id: item.link,
    title: item.title,
    url: item.link,
    pubDate: item.pubDate,
    extra: {
      hover: typeof item.description === "string" ? item.description.replace(/<[^>]*>/g, "").slice(0, 100) : "",
    },
  }))
})
