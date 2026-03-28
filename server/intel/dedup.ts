import type { NewsItem } from "@shared/types"

export function hashUrl(url: string): string {
  // Simple hash compatible with all runtimes (no node:crypto needed)
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash).toString(36).padStart(8, "0").substring(0, 16)
}

export function dedup(items: NewsItem[], existingIds: Set<string>): NewsItem[] {
  return items.filter(item => !existingIds.has(hashUrl(item.url)))
}
