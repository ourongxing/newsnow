import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
    staleTime: 30 * 60 * 1000,
  })
}

export function useIntelRefresh() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/intel/refresh", { method: "POST" })
      if (res.status === 409) throw new Error("refresh_in_progress")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || "Refresh failed")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intel"] })
    },
  })
}
