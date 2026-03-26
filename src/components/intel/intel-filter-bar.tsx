const SOURCES = [
  { id: "hackernews", label: "HN" },
  { id: "github-trending-today", label: "GitHub" },
  { id: "v2ex", label: "V2EX" },
  { id: "juejin", label: "掘金" },
  { id: "producthunt", label: "PH" },
  { id: "36kr", label: "36氪" },
  { id: "sspai", label: "少数派" },
]

interface FilterBarProps {
  activeSources: Set<string>
  onSourceToggle: (sourceId: string) => void
  activeSort: "score" | "time"
  onSortChange: (sort: "score" | "time") => void
}

export function IntelFilterBar({ activeSources, onSourceToggle, activeSort, onSortChange }: FilterBarProps) {
  const allSelected = activeSources.size === 0

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSourceToggle("all")}
          className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
            allSelected
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          全部
        </button>
        {SOURCES.map(source => (
          <button
            key={source.id}
            onClick={() => onSourceToggle(source.id)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              activeSources.has(source.id)
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {source.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        {(["score", "time"] as const).map(sort => (
          <button
            key={sort}
            onClick={() => onSortChange(sort)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              activeSort === sort
                ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {sort === "score" ? "按评分" : "按时间"}
          </button>
        ))}
      </div>
    </div>
  )
}
