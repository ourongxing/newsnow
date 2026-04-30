import { describe, expect, it } from "vitest"
import { verifyPrimitiveMetadata } from "./verify"

describe("verifyPrimitiveMetadata", () => {
  it("accepts valid metadata", () => {
    const valid = {
      data: { focus: ["source1", "source2"] },
      updatedTime: 1714521600000,
    }
    const result = verifyPrimitiveMetadata(valid)
    expect(result).toEqual(valid)
  })

  it("rejects missing data field", () => {
    expect(() => verifyPrimitiveMetadata({ updatedTime: 1 })).toThrow()
  })

  it("rejects missing updatedTime field", () => {
    expect(() => verifyPrimitiveMetadata({ data: { focus: [] } })).toThrow()
  })

  it("rejects wrong data type", () => {
    expect(() => verifyPrimitiveMetadata({ data: "not-object", updatedTime: 1 })).toThrow()
  })

  it("rejects non-number updatedTime", () => {
    expect(() => verifyPrimitiveMetadata({ data: { focus: [] }, updatedTime: "string" })).toThrow()
  })

  it("accepts empty data record", () => {
    const valid = {
      data: {},
      updatedTime: 0,
    }
    const result = verifyPrimitiveMetadata(valid)
    expect(result).toEqual(valid)
  })
})
