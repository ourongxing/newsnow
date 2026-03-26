import { createHash } from "node:crypto"
import type { NewsItem } from "@shared/types"

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").substring(0, 16)
}

export function dedup(items: NewsItem[], existingIds: Set<string>): NewsItem[] {
  return items.filter(item => !existingIds.has(hashUrl(item.url)))
}
