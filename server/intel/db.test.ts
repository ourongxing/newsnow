import { beforeEach, describe, expect, it, vi } from "vitest"

import { cleanExpiredScores, getExistingIds, initIntelTable, queryScores, saveScores } from "./db"

const mockRun = vi.fn().mockResolvedValue(undefined)
const mockAll = vi.fn()
const mockBind = vi.fn(() => ({ all: mockAll, run: mockRun }))
const mockDb = {
  prepare: vi.fn(() => ({ bind: mockBind, all: mockAll, run: mockRun })),
  exec: vi.fn().mockResolvedValue(undefined),
  batch: vi.fn().mockResolvedValue([]),
}

describe("intel db", () => {
  beforeEach(() => vi.clearAllMocks())

  it("initIntelTable executes CREATE TABLE", async () => {
    mockDb.exec.mockResolvedValue(undefined)
    await initIntelTable(mockDb as any)
    expect(mockDb.exec).toHaveBeenCalled()
  })

  it("saveScores uses batch insert", async () => {
    const items = [{
      id: "abc",
      source_id: "hackernews",
      title: "Test",
      url: "https://x.com",
      pub_date: 100,
      score: 8.5,
      summary: "s",
      reason: "r",
      scored_at: 200,
      created_at: 200,
    }]
    await saveScores(mockDb as any, items)
    expect(mockDb.batch).toHaveBeenCalled()
  })

  it("queryScores returns paginated results", async () => {
    mockAll.mockResolvedValueOnce({ results: [{ total: 1 }] })
    mockAll.mockResolvedValueOnce({ results: [{ id: "a", score: 9.0 }] })
    const result = await queryScores(mockDb as any, { sort: "score", page: 1, limit: 20 })
    expect(result).toBeDefined()
  })

  it("getExistingIds returns empty set for empty input", async () => {
    const result = await getExistingIds(mockDb as any, [])
    expect(result).toBeInstanceOf(Set)
    expect(result.size).toBe(0)
  })

  it("cleanExpiredScores calls DELETE with threshold", async () => {
    await cleanExpiredScores(mockDb as any, 7)
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("DELETE"))
  })
})
