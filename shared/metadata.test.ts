import { describe, expect, it } from "vitest"
import { columns, metadata, fixedColumnIds, hiddenColumns } from "./metadata"

describe("metadata", () => {
  it("has all columns defined", () => {
    const columnKeys = Object.keys(columns)
    expect(columnKeys.length).toBeGreaterThanOrEqual(7)
  })

  it("has at least focus, hottest, realtime columns", () => {
    expect(columns).toHaveProperty("focus")
    expect(columns).toHaveProperty("hottest")
    expect(columns).toHaveProperty("realtime")
  })

  it("each column has a Chinese name", () => {
    for (const col of Object.values(columns)) {
      expect(col.zh).toBeTruthy()
    }
  })

  it("fixed columns are present in columns", () => {
    for (const id of fixedColumnIds) {
      expect(columns).toHaveProperty(id)
    }
  })

  it("all hidden columns exist in full columns list", () => {
    for (const id of hiddenColumns) {
      expect(columns).toHaveProperty(id)
    }
  })

  it("metadata has all columns mapped", () => {
    const metadataKeys = Object.keys(metadata)
    expect(metadataKeys.length).toBe(Object.keys(columns).length)
  })

  it("each metadata entry has name and sources array", () => {
    for (const col of Object.values(metadata)) {
      expect(col.name).toBeTruthy()
      expect(Array.isArray(col.sources)).toBe(true)
    }
  })
})
