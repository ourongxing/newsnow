import type { SourceResponse } from "@shared/types"

export function jsonToRSS(response: SourceResponse): string {
  const { id, items, updatedTime } = response
  const date = new Date(updatedTime).toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${id} News</title>
    <link>https://newsnow.com/${id}</link>
    <description>Latest news from ${id}</description>
    <lastBuildDate>${date}</lastBuildDate>
    <pubDate>${date}</pubDate>
    ${items.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <description>${escapeXml(item.extra?.info || "")}</description>
      <pubDate>${new Date(item.extra?.date || updatedTime).toUTCString()}</pubDate>
      <guid>${escapeXml(item.id.toString())}</guid>
    </item>
    `).join("")}
  </channel>
</rss>`
}

export function jsonToAtom(response: SourceResponse): string {
  const { id, items, updatedTime } = response
  const date = new Date(updatedTime).toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${id} News</title>
  <link href="https://newsnow.com/${id}"/>
  <updated>${date}</updated>
  <id>urn:uuid:${id}</id>
  ${items.map(item => `
  <entry>
    <title>${escapeXml(item.title)}</title>
    <link href="${escapeXml(item.url)}"/>
    <summary>${escapeXml(item.extra?.info || "")}</summary>
    <updated>${new Date(item.extra?.date || updatedTime).toISOString()}</updated>
    <id>${escapeXml(item.id.toString())}</id>
  </entry>
  `).join("")}
</feed>`
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "<"
      case ">": return ">"
      case "&": return "&"
      case "'": return `'`
      case "\"": return "\""
      default: return c
    }
  })
}
