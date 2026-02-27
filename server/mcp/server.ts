import { z } from "zod"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import packageJSON from "../../package.json"
import { description, sourceList } from "./desc.js"

let _server: McpServer | undefined

export function getServer() {
  // Reuse the same McpServer across requests so tool registrations
  // are not duplicated and per-request connect/close churn is avoided.
  if (_server) return _server

  const server = new McpServer(
    {
      name: "NewsNow",
      version: packageJSON.version,
    },
    { capabilities: { logging: {} } },
  )

  server.tool(
    "list_sources",
    "List all available news source ids with their names. Call this first to discover valid source ids before fetching news.",
    {},
    async (): Promise<CallToolResult> => {
      return {
        content: [{
          text: sourceList(),
          type: "text",
        }],
      }
    },
  )

  server.tool(
    "get_hotest_latest_news",
    `Get hottest or latest news from a source by its {id}. Returns up to {count} news items. Use list_sources to discover valid source ids.`,
    {
      id: z.string().describe(`source id. e.g. ${description}`),
      count: z.number().default(10).describe("number of news items to return, default 10."),
    },
    async ({ id, count }): Promise<CallToolResult> => {
      let n = Number(count)
      if (Number.isNaN(n) || n < 1) {
        n = 10
      }

      try {
        const res: SourceResponse = await $fetch(`/api/s?id=${id}`)
        return {
          content: res.items.slice(0, n).map((item) => {
            return {
              text: `[${item.title}](${item.url})`,
              type: "text",
            }
          }),
        }
      } catch (e: any) {
        return {
          isError: true,
          content: [{
            text: `Failed to fetch news from source "${id}": ${e instanceof Error ? e.message : String(e)}`,
            type: "text",
          }],
        }
      }
    },
  )

  server.server.onerror = console.error.bind(console)

  _server = server
  return server
}

/**
 * Reset the singleton — only used for testing.
 * @internal
 */
export function _resetServer() {
  _server = undefined
}
