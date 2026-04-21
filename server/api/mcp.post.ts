import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { getServer } from "#/mcp/server"

export default defineEventHandler(async (event) => {
  const req = event.node.req
  const res = event.node.res
  const server = getServer()
  try {
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    transport.onerror = console.error.bind(console)
    await server.connect(transport)
    await transport.handleRequest(req, res, await readBody(event))
    res.on("close", () => {
      // Only close the per-request transport, not the shared server.
      // The server is a singleton that outlives individual requests;
      // closing it here would tear down tool registrations for all
      // subsequent requests.
      transport.close()
    })
    return res
  } catch (e) {
    console.error(e)
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal server error",
      },
      id: null,
    }
  }
})
