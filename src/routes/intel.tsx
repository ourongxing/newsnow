import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { useIntel, useIntelRefresh } from "~/hooks/useIntel"
import { IntelFilterBar } from "~/components/intel/intel-filter-bar"
import { IntelList } from "~/components/intel/intel-list"
import type { IntelItem } from "@shared/intel-types"

export const Route = createFileRoute("/intel")({
  component: IntelPage,
})

function IntelPage() {
  const [activeSources, setActiveSources] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<"score" | "time">("score")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<IntelItem[]>([])

  const sourcesArray = [...activeSources]
  const { data, isLoading, isFetching } = useIntel({ sort, page, sources: sourcesArray })
  const refreshMutation = useIntelRefresh()

  const items = page === 1 ? (data?.items || []) : [...accumulated, ...(data?.items || [])]

  const handleSourceToggle = useCallback((sourceId: string) => {
    if (sourceId === "all") {
      setActiveSources(new Set())
    } else {
      setActiveSources(prev => {
        const next = new Set(prev)
        if (next.has(sourceId)) next.delete(sourceId)
        else next.add(sourceId)
        return next
      })
    }
    setPage(1)
    setAccumulated([])
  }, [])

  const handleSortChange = useCallback((newSort: "score" | "time") => {
    setSort(newSort)
    setPage(1)
    setAccumulated([])
  }, [])

  const handleLoadMore = useCallback(() => {
    if (data?.has_more) {
      setAccumulated(items)
      setPage(p => p + 1)
    }
  }, [data, items])

  const handleRefresh = useCallback(() => {
    refreshMutation.mutate()
    setPage(1)
    setAccumulated([])
  }, [refreshMutation])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI 情报站</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          className="px-3 py-1.5 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {refreshMutation.isPending ? "刷新中..." : "刷新"}
        </button>
      </div>

      {refreshMutation.isError && (
        <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
          {refreshMutation.error.message === "refresh_in_progress"
            ? "正在刷新中，请稍后..."
            : `刷新失败: ${refreshMutation.error.message}`}
        </div>
      )}

      <IntelFilterBar
        activeSources={activeSources}
        onSourceToggle={handleSourceToggle}
        activeSort={sort}
        onSortChange={handleSortChange}
      />

      <IntelList
        items={items}
        hasMore={data?.has_more || false}
        isLoading={isLoading || isFetching}
        onLoadMore={handleLoadMore}
      />

      {data?.last_refreshed_at && (
        <div className="mt-4 text-center text-xs text-gray-400">
          最后更新: {new Date(data.last_refreshed_at * 1000).toLocaleString("zh-CN")}
        </div>
      )}
    </div>
  )
}
