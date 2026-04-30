import { describe, expect, it } from "vitest"
import { myCrypto, md5 } from "./crypto"

describe("md5", () => {
  it("produces consistent md5 hash", async () => {
    const hash = await md5("test")
    expect(hash).toBeTruthy()
    expect(hash.length).toBe(32)
  })

  it("same input produces same hash", async () => {
    const [h1, h2] = await Promise.all([md5("hello"), md5("hello")])
    expect(h1).toBe(h2)
  })

  it("different inputs produce different hashes", async () => {
    const [h1, h2] = await Promise.all([md5("hello"), md5("world")])
    expect(h1).not.toBe(h2)
  })

  it("handles empty string", async () => {
    const hash = await md5("")
    // d41d8cd98f00b204e9800998ecf8427e is md5("")
    expect(hash).toBeTruthy()
  })
})

describe("myCrypto", () => {
  it("supports SHA-256", async () => {
    const hash = await myCrypto("test", "SHA-256")
    expect(hash).toBeTruthy()
    expect(hash.length).toBe(64)
  })

  it("supports SHA-1", async () => {
    const hash = await myCrypto("test", "SHA-1")
    expect(hash).toBeTruthy()
    expect(hash.length).toBe(40)
  })
})
