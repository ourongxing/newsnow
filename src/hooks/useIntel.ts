import { useCallback, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { IntelResponse } from "@shared/intel-types"

interface UseIntelParams {
  sort?: "score" | "time"
  page?: number
  limit?: number
  sources?: string[]
}

export function useIntel(params: UseIntelParams = {}, pollingInterval?: number) {
  const { sort = "score", page = 1, limit = 20, sources = [] } = params
  const sourceParam = sources.length > 0 ? sources.join(",") : "all"

  return useQuery<IntelResponse>({
    queryKey: ["intel", sort, page, limit, sourceParam],
    queryFn: async () => {
      const res = await fetch(`/api/intel?sort=${sort}&page=${page}&limit=${limit}&source=${sourceParam}`)
      if (!res.ok) throw new Error("Failed to fetch intel")
      return res.json()
    },
    staleTime: pollingInterval ? 0 : 30 * 60 * 1000,
    refetchInterval: pollingInterval || false,
  })
}

export function useIntelRefresh() {
  const queryClient = useQueryClient()
  const [scoring, setScoring] = useState(false)
  const prevRefreshedAt = useRef<number | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/intel/refresh", { method: "POST" })
      if (res.status === 409) throw new Error("refresh_in_progress")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || "Refresh failed")
      }
      return res.json()
    },
    onMutate: () => {
      // Capture current last_refreshed_at before refresh
      const cache = queryClient.getQueriesData<IntelResponse>({ queryKey: ["intel"] })
      for (const [, data] of cache) {
        if (data?.last_refreshed_at) {
          prevRefreshedAt.current = data.last_refreshed_at
          break
        }
      }
      setScoring(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intel"] })
    },
    onError: () => {
      setScoring(false)
    },
  })

  // Call this from the component to check if scoring is done
  const checkScoringDone = useCallback((currentRefreshedAt: number | null) => {
    if (!scoring) return
    if (currentRefreshedAt && currentRefreshedAt !== prevRefreshedAt.current) {
      setScoring(false)
    }
  }, [scoring])

  return {
    ...mutation,
    scoring,
    checkScoringDone,
  }
}
