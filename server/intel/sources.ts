import type { NewsItem } from "@shared/types"
import { sourcesGetters } from "../getters"

export async function fetchConfiguredSources(
  sourceIds: string[],
): Promise<(NewsItem & { _sourceId: string })[]> {
  const results = await Promise.allSettled(
    sourceIds.map(async (id) => {
      const getter = sourcesGetters[id as keyof typeof sourcesGetters]
      if (!getter) {
        console.warn(`[intel] Source getter not found: ${id}`)
        return []
      }
      const items = await getter()
      return items.map(item => ({ ...item, _sourceId: id }))
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
