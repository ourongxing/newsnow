import { describe, expect, it, vi } from "vitest"
import { relativeTime, delay, randomUUID, randomItem } from "./utils"

describe("relativeTime", () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-01T12:00:00Z"))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("returns undefined for empty input", () => {
    expect(relativeTime("")).toBeUndefined()
    expect(relativeTime(0)).toBeUndefined()
  })

  it("returns undefined for NaN date", () => {
    expect(relativeTime("invalid")).toBeUndefined()
  })

  it("returns '刚刚' for less than 60 seconds", () => {
    const now = Date.now()
    expect(relativeTime(now - 10 * 1000)).toBe("刚刚")
    expect(relativeTime(now - 59 * 1000)).toBe("刚刚")
  })

  it("returns minutes for less than 60 minutes", () => {
    const now = Date.now()
    expect(relativeTime(now - 5 * 60 * 1000)).toBe("5分钟前")
    expect(relativeTime(now - 30 * 60 * 1000)).toBe("30分钟前")
  })

  it("returns hours for less than 24 hours", () => {
    const now = Date.now()
    expect(relativeTime(now - 2 * 60 * 60 * 1000)).toBe("2小时前")
    expect(relativeTime(now - 12 * 60 * 60 * 1000)).toBe("12小时前")
  })

  it("returns month and day for 24+ hours", () => {
    const now = Date.now()
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000
    const result = relativeTime(twoDaysAgo)
    expect(result).toMatch(/^\d+月\d+日$/)
  })
})

describe("delay", () => {
  it("resolves after specified ms", async () => {
    const start = Date.now()
    const p = delay(50)
    expect(p).toBeInstanceOf(Promise)
    await p
    expect(Date.now() - start).toBeGreaterThanOrEqual(45)
  })
})

describe("randomUUID", () => {
  it("generates valid UUID format", () => {
    const uuid = randomUUID()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it("generates unique values", () => {
    const uuids = new Set(Array.from({ length: 100 }, () => randomUUID()))
    expect(uuids.size).toBe(100)
  })
})

describe("randomItem", () => {
  it("returns an item from the array", () => {
    const arr = [1, 2, 3, 4, 5]
    const item = randomItem(arr)
    expect(arr).toContain(item)
  })

  it("returns undefined for empty array", () => {
    expect(randomItem([])).toBeUndefined()
  })

  it("returns the only item for single-element array", () => {
    expect(randomItem([42])).toBe(42)
  })
})
