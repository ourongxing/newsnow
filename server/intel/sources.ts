import type { NewsItem } from "@shared/types"
import { getters } from "#/getters"

export async function fetchConfiguredSources(
  sourceIds: string[],
): Promise<(NewsItem & { _sourceId: string })[]> {
  const results = await Promise.allSettled(
    sourceIds.map(async (id) => {
      const getter = (getters as any)[id]
      if (!getter) {
        console.warn(`[intel] Source getter not found: ${id}`)
        return []
      }
      const items = (await getter()).slice(0, 15)
      return items.map((item: NewsItem) => ({ ...item, _sourceId: id }))
    }),
  )

  const allItems: (NewsItem & { _sourceId: string })[] = []
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value)
    } else {
      console.error(`[intel] Source fetch failed:`, result.reason)
    }
  }
  return allItems
}
