import { z } from "zod"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import packageJSON from "../../package.json"
import { description } from "./desc.js"

export function getServer() {
  const server = new McpServer(
    {
      name: "NewsNow",
      version: packageJSON.version,
    },
    { capabilities: { logging: {} } },
  )

  server.tool(
    "get_hotest_latest_news",
    `get hotest or latest news from source by {id}, return {count: 10} news.`,
    {
      id: z.string().describe(`source id. e.g. ${description}`),
      count: z.any().default(10).describe("count of news to return."),
    },
    async ({ id, count }): Promise<CallToolResult> => {
      let n = Number(count)
      if (Number.isNaN(n) || n < 1) {
        n = 10
      }

      const res: SourceResponse = await $fetch(`/api/s?id=${id}`)
      return {
        content: res.items.slice(0, count).map((item) => {
          return {
            text: `[${item.title}](${item.url})`,
            type: "text",
          }
        }),
      }
    },
  )

  server.server.onerror = console.error.bind(console)

  return server
}
