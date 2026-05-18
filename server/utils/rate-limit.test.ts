import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { rateLimit } from "#/utils/rate-limit"

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("首次请求返回 ok: true", () => {
    expect(rateLimit("a:first", 5, 60_000).ok).toBe(true)
  })

  it("limit 以内的请求全部通过", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("a:within", 5, 60_000).ok).toBe(true)
    }
  })

  it("超出 limit 后返回 ok: false", () => {
    for (let i = 0; i < 5; i++) rateLimit("a:exceed", 5, 60_000)
    expect(rateLimit("a:exceed", 5, 60_000).ok).toBe(false)
  })

  it("retryAfter 等于窗口剩余秒数", () => {
    for (let i = 0; i < 5; i++) rateLimit("a:retry", 5, 60_000)
    vi.advanceTimersByTime(20_000)
    const { retryAfter } = rateLimit("a:retry", 5, 60_000)
    expect(retryAfter).toBe(40)
  })

  it("窗口过期后计数重置，重新允许请求", () => {
    for (let i = 0; i < 5; i++) rateLimit("a:reset", 5, 60_000)
    expect(rateLimit("a:reset", 5, 60_000).ok).toBe(false)

    vi.advanceTimersByTime(60_000)
    expect(rateLimit("a:reset", 5, 60_000).ok).toBe(true)
  })

  it("超过 1000 个 bucket 时触发清理不崩溃", () => {
    // 填入 1001 个短窗口 bucket
    for (let i = 0; i < 1001; i++) {
      rateLimit(`a:cleanup:${i}`, 1, 1)
    }
    // 让全部过期
    vi.advanceTimersByTime(10)
    // 强制命中 1% 清理概率
    vi.spyOn(Math, "random").mockReturnValue(0)
    expect(() => rateLimit("a:cleanup:trigger", 1, 60_000)).not.toThrow()
    vi.spyOn(Math, "random").mockRestore()
  })
})
