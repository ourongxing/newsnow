import { describe, expect, it } from "vitest"
import { originSources } from "./pre-sources"
import { sources } from "./sources"

describe("originSources configuration", () => {
  it("has many source entries", () => {
    const keys = Object.keys(originSources)
    expect(keys.length).toBeGreaterThan(20)
  })

  it("non-disabled sources have required fields", () => {
    for (const [id, src] of Object.entries(originSources)) {
      if (src.disable) continue
      expect(src.name, `${id} should have name`).toBeTruthy()
      expect(src.color, `${id} should have color`).toBeTruthy()
      expect(src.home, `${id} should have home`).toBeTruthy()
    }
  })

  it("all source homes are valid URLs", () => {
    for (const src of Object.values(originSources)) {
      if (src.disable) continue
      expect(src.home).toMatch(/^https?:\/\//)
    }
  })

  it("sources with sub-sources have valid sub configuration", () => {
    for (const [id, src] of Object.entries(originSources)) {
      if (src.sub) {
        for (const [subKey, sub] of Object.entries(src.sub)) {
          expect(sub.title, `${id}.${subKey} should have title`).toBeTruthy()
        }
      }
    }
  })

  it("sources only use valid column names", () => {
    const validColumns = new Set(["china", "world", "tech", "finance", "focus"])
    for (const src of Object.values(originSources)) {
      if (src.disable) continue
      if (src.column) {
        expect(validColumns.has(src.column), `${src.name} column "${src.column}" is not valid`).toBe(true)
      }
    }
  })
})

describe("resolved sources", () => {
  it("all sources have resolved correctly", () => {
    const sourceKeys = Object.keys(sources)
    expect(sourceKeys.length).toBeGreaterThan(0)
  })

  it("every source has proper interval", () => {
    for (const [id, src] of Object.entries(sources)) {
      expect(src.interval, `${id} should have interval > 0`).toBeGreaterThan(0)
      expect(Number.isFinite(src.interval)).toBe(true)
    }
  })

  it("sources have valid types", () => {
    const validTypes = new Set(["hottest", "realtime", undefined])
    for (const [id, src] of Object.entries(sources)) {
      expect(validTypes.has(src.type), `${id} type "${src.type}" is not valid`).toBe(true)
    }
  })
})
