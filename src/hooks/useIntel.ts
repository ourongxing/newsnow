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
      const res = await fetch(`/api/intel?sort=${sort}&page=${page}&limit=${limit}&source=${sourceParam}&refresh=true`)
      if (!res.ok) throw new Error("Failed to fetch intel")
      return res.json()
    },
    staleTime: 30 * 60 * 1000,
    // If no data yet (total=0), poll every 5s to pick up scoring results
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || data.total === 0) return 5000
      return false
    },
  })
}
