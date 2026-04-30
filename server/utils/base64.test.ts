import { describe, expect, it } from "vitest"
import { decodeBase64URL, encodeBase64URL, decodeBase64, encodeBase64 } from "./base64"

describe("base64", () => {
  it("encodes and decodes base64", () => {
    const original = "hello world"
    const encoded = encodeBase64(original)
    expect(encoded).toBe("aGVsbG8gd29ybGQ=")
    expect(decodeBase64(encoded)).toBe(original)
  })

  it("encodes and decodes base64 URL", () => {
    const original = "hello world+test"
    const encoded = encodeBase64URL(original)
    expect(decodeBase64URL(encoded)).toBe(original)
  })

  it("handles empty string", () => {
    expect(encodeBase64("")).toBe("")
    expect(decodeBase64("")).toBe("")
  })

  it("handles unicode characters", () => {
    const original = "你好世界"
    const encoded = encodeBase64(original)
    expect(decodeBase64(encoded)).toBe(original)
  })

  it("handles special characters", () => {
    const original = "test+/=123"
    const encoded = encodeBase64URL(original)
    expect(decodeBase64URL(encoded)).toBe(original)
  })
})
