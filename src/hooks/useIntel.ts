import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { IntelResponse } from "@shared/intel-types"

interface UseIntelParams {
  sort?: "score" | "time"
  page?: number
  limit?: number
  sources?: string[] // multi-select
}

export function useIntel(params: UseIntelParams = {}) {
  const { sort = "score", page = 1, limit = 20, sources = [] } = params
  const sourceParam = sources.length > 0 ? sources.join(",") : "all"

  return useQuery<IntelResponse>({
    queryKey: ["intel", sort, page, limit, sourceParam],
    queryFn: () => $fetch<IntelResponse>(`/api/intel`, {
      params: { sort, page, limit, source: sourceParam },
    }),
    staleTime: 30 * 60 * 1000,
  })
}

export function useIntelRefresh() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await $fetch<{ status: string }>("/api/intel/refresh", {
        method: "POST",
        ignoreResponseError: true,
      }).catch((err) => {
        if (err?.status === 409) throw new Error("refresh_in_progress")
        throw err
      })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intel"] })
    },
  })
}
