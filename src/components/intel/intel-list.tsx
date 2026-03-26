import type { IntelItem } from "@shared/intel-types"
import { IntelCard } from "./intel-card"

interface IntelListProps {
  items: IntelItem[]
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}

export function IntelList({ items, hasMore, isLoading, onLoadMore }: IntelListProps) {
  if (isLoading && items.length === 0) {
    return <div className="flex justify-center py-12 text-gray-400">加载中...</div>
  }
  if (items.length === 0) {
    return <div className="flex justify-center py-12 text-gray-400">暂无数据，请点击刷新</div>
  }
  return (
    <div>
      {items.map(item => <IntelCard key={item.id} item={item} />)}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {isLoading ? "加载中..." : "加载更多"}
        </button>
      )}
    </div>
  )
}
