import process from "node:process"
import type { H3Event } from "h3"
import { setResponseHeader } from "h3"
import { jwtVerify } from "jose"
import { rateLimit } from "#/utils/rate-limit"

function enforce(key: string, limit: number, windowMs: number, event: H3Event) {
  const { ok, retryAfter } = rateLimit(key, limit, windowMs)
  if (!ok) {
    setResponseHeader(event, "Retry-After", retryAfter)
    throw createError({ statusCode: 429, message: "Too many requests" })
  }
}

function clientIP(event: H3Event): string {
  return getHeader(event, "cf-connecting-ip")
    || getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown"
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith("/api")) return

  // /api/login: 限 IP，5 次/分钟（防止反复触发 OAuth 跳转）
  if (url.pathname.startsWith("/api/login")) {
    enforce(`login:${clientIP(event)}`, 5, 60_000, event)
  }

  if (["JWT_SECRET", "G_CLIENT_ID", "G_CLIENT_SECRET"].find(k => !process.env[k])) {
    event.context.disabledLogin = true
    if (["/api/s", "/api/proxy", "/api/latest", "/api/mcp"].every(p => !url.pathname.startsWith(p)))
      throw createError({ statusCode: 506, message: "Server not configured, disable login" })
  } else {
    if (["/api/s", "/api/me"].find(p => url.pathname.startsWith(p))) {
      const token = getHeader(event, "Authorization")?.replace(/Bearer\s*/, "")?.trim()
      if (token) {
        try {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) as { payload?: { id: string, type: string } }
          if (payload?.id) {
            event.context.user = {
              id: payload.id,
              type: payload.type,
            }
          }
        } catch {
          if (url.pathname.startsWith("/api/me"))
            throw createError({ statusCode: 401, message: "JWT verification failed" })
          else logger.warn("JWT verification failed")
        }
      } else if (url.pathname.startsWith("/api/me")) {
        throw createError({ statusCode: 401, message: "JWT verification failed" })
      }

      // /api/me/*: 限用户，30 次/分钟（客户端 useDebounce 10s，正常人最多 6 次/分钟）
      if (url.pathname.startsWith("/api/me") && event.context.user) {
        enforce(`me:${event.context.user.id}`, 30, 60_000, event)
      }
    }
  }
})
