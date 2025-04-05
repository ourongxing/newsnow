import type { NewsItem } from "@shared/types"
import type { RSSItem } from "../types"
import { defineSource } from "../utils/source"
import { rss2json } from "../utils/rss2json"
import { logger } from "../utils/logger" // Keep logger for specific warnings

const YAHOO_FINANCE_RSS_URL = "https://finance.yahoo.com/rss/topstories"

export default defineSource(async () => {
  logger.info("Yahoo Finance source execution started.") // Added log
  // defineSource likely handles generic errors, but we keep specific checks/logs
  const rssInfo = await rss2json(YAHOO_FINANCE_RSS_URL)

  // Check if rssInfo and rssInfo.items exist before proceeding
  if (!rssInfo || !rssInfo.items) {
    logger.warn("Yahoo Finance RSS feed did not return valid items.")
    return []
  }

  const rssItems = rssInfo.items

  const newsItems: NewsItem[] = rssItems.map((item: RSSItem) => ({
    // Use link as a unique ID, assuming it's stable
    id: item.link,
    title: item.title,
    url: item.link,
    // rss2json usually provides 'created' as a string date
    // Convert to timestamp
    pubDate: item.created ? new Date(item.created).getTime() : undefined,
  }))

  logger.info(`Yahoo Finance source processed ${newsItems.length} items.`) // Added log
  return newsItems
})
