import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// ---------------------------------------------------------------------------
// Source-level tests that verify the MCP server module by inspecting its
// TypeScript source. They run without network, without building, and without
// importing any runtime dependency beyond vitest + Node builtins.
// ---------------------------------------------------------------------------

const serverSrc = readFileSync(join(__dirname, "../server/mcp/server.ts"), "utf-8")
const descSrc = readFileSync(join(__dirname, "../server/mcp/desc.js"), "utf-8")
const postSrc = readFileSync(join(__dirname, "../server/api/mcp.post.ts"), "utf-8")

// ---- Bug #1: count/n variable shadowing -----------------------------------

describe("count variable bug fix", () => {
  it("should use validated `n` in .slice(), not raw `count`", () => {
    // The original code validated `count` into `n` but then called
    // `res.items.slice(0, count)` with the raw unvalidated `count`.
    // After the fix, `slice(0, n)` should be used.
    expect(serverSrc).toContain(".slice(0, n)")
    expect(serverSrc).not.toMatch(/\.slice\(0,\s*count\)/)
  })

  it("should use z.number() instead of z.any() for count schema", () => {
    // z.any() provides no schema information to the LLM client and no
    // automatic coercion.  z.number() tells MCP clients the expected type.
    expect(serverSrc).toContain("z.number()")
    expect(serverSrc).not.toMatch(/count:\s*z\.any\(\)/)
  })
})

// ---- Bug #2: no error handling in tool ------------------------------------

describe("mCP tool error handling", () => {
  it("should wrap $fetch in try/catch", () => {
    // The tool should catch fetch errors and return { isError: true }
    // instead of letting the exception propagate and crash the MCP call.
    expect(serverSrc).toContain("isError: true")
  })

  it("should include the source id in the error message", () => {
    // The error message should mention which source failed.
    expect(serverSrc).toMatch(/Failed to fetch.*\$\{id\}/)
  })

  it("should return CallToolResult with error content, not throw", () => {
    // After catch, the handler should return a result with isError, not re-throw.
    // Verify by checking that `isError` appears in the same function scope.
    const catchIdx = serverSrc.indexOf("catch (e")
    expect(catchIdx).toBeGreaterThan(-1)
    const afterCatch = serverSrc.slice(catchIdx, catchIdx + 300)
    expect(afterCatch).toContain("return")
    expect(afterCatch).toContain("isError")
  })
})

// ---- Bug #3: per-request server creation ----------------------------------

describe("server singleton pattern", () => {
  it("should cache the server instance in a module-level variable", () => {
    // The server should be created once and reused, not recreated per request.
    expect(serverSrc).toMatch(/let\s+_server/)
    expect(serverSrc).toContain("if (_server) return _server")
  })

  it("should assign to _server before returning", () => {
    expect(serverSrc).toContain("_server = server")
  })

  it("should export _resetServer for testing", () => {
    expect(serverSrc).toContain("export function _resetServer()")
  })
})

// ---- Bug #4: server.close() called per-request ----------------------------

describe("mcp.post.ts should not close the shared server", () => {
  it("should not call server.close() in res.on close handler", () => {
    // The original code called `server.close()` per request which would
    // tear down tool registrations for subsequent requests.
    expect(postSrc).not.toMatch(/server\.close\(\)/)
  })

  it("should still close the per-request transport", () => {
    expect(postSrc).toContain("transport.close()")
  })
})

// ---- Feature: list_sources tool -------------------------------------------

describe("list_sources tool (addresses #314)", () => {
  it("should register a list_sources tool", () => {
    expect(serverSrc).toContain("\"list_sources\"")
  })

  it("should import sourceList from desc", () => {
    expect(serverSrc).toMatch(/import\s*\{[^}]*sourceList[^}]*\}\s*from/)
  })

  it("desc.js should export sourceList function", () => {
    expect(descSrc).toContain("export function sourceList()")
  })

  it("desc.js sourceList should format as id: name per line", () => {
    // The function should produce "id: Name" or "id: Name - Subtitle" lines.
    expect(descSrc).toMatch(/`\$\{id\}:\s*\$\{label\}`/)
  })
})

// ---- desc.js: source filtering consistency --------------------------------

describe("desc.js source filtering", () => {
  it("should filter out redirected sources", () => {
    expect(descSrc).toContain("source.redirect")
    expect(descSrc).toContain("return false")
  })

  it("description and sourceList should use the same filtered entries", () => {
    // Both should be derived from the same `entries` variable
    // to ensure consistency.
    expect(descSrc).toMatch(/const\s+entries\s*=/)
    expect(descSrc).toMatch(/entries\.map/)
  })
})

// ---- Regression: sources.json is valid ------------------------------------

describe("sources.json integrity", () => {
  const sourcesPath = join(__dirname, "../shared/sources.json")
  const sources = JSON.parse(readFileSync(sourcesPath, "utf-8"))
  const entries = Object.entries(sources)

  it("should have at least 30 sources", () => {
    expect(entries.length).toBeGreaterThanOrEqual(30)
  })

  it("every non-redirect source should have a name", () => {
    for (const [id, source] of entries) {
      const s = source as any
      if (!s.redirect) {
        expect(s.name, `source ${id} missing name`).toBeTruthy()
      }
    }
  })
})
