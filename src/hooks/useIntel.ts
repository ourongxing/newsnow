import { useQuery } from "@tanstack/react-query"
import type { IntelResponse } from "@shared/intel-types"

interface UseIntelParams {
  sort?: "score" | "time"
  page?: number
  limit?: number
  sources?: string[]
}

export function useIntel(params: UseIntelParams = {}) {
  const { sort = "score", page = 1, limit = 20, sources = [] } = params
  const sourceParam = sources.length > 0 ? sources.join(",") : "all"

  return useQuery<IntelResponse>({
    queryKey: ["intel", sort, page, limit, sourceParam],
    queryFn: async () => {
      const res = await fetch(`/api/intel?sort=${sort}&page=${page}&limit=${limit}&source=${sourceParam}`)
      if (!res.ok) throw new Error("Failed to fetch intel")
      return res.json()
    },
    // No data yet: poll every 5s to catch first scoring result
    // Has data: poll every 30s to pick up new scores
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || data.total === 0) return 5000
      return 30000
    },
  })
}
