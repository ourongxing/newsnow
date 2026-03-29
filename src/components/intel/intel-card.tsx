import type { IntelItem } from "@shared/intel-types"

function scoreColor(score: number): string {
  if (score >= 8) return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30"
  if (score >= 6) return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30"
  return "text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/50"
}

function relativeTime(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - timestamp
  if (diff < 60) return "刚刚"
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

const SOURCE_LABELS: Record<string, string> = {
  "hackernews": "HN",
  "github-trending-today": "GitHub",
  "v2ex": "V2EX",
  "juejin": "掘金",
  "36kr": "36氪",
  "sspai": "少数派",
}

export function IntelCard({ item }: { item: IntelItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-bold ${scoreColor(item.score)}`}>
          {item.score.toFixed(1)}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {SOURCE_LABELS[item.source_id] || item.source_id}
          </span>
          <span>{relativeTime(item.pub_date ? Math.floor(item.pub_date / 1000) : item.scored_at)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-1.5 leading-relaxed">
        {item.summary || item.title}
      </p>
      {item.reason && (
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          {item.reason}
        </p>
      )}
    </a>
  )
}
