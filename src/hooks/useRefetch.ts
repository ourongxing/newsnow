import type { SourceID } from "@shared/types"
import { useUpdateQuery } from "./query"
import { refetchSources } from "~/utils/data"

export function useRefetch() {
  const updateQuery = useUpdateQuery()
  /**
   * force refresh
   */
  const refresh = useCallback((...sources: SourceID[]) => {
    refetchSources.clear()
    sources.forEach(id => refetchSources.add(id))
    updateQuery(...sources)
  }, [updateQuery])

  return {
    refresh,
    refetchSources,
  }
}
