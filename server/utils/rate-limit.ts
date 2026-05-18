// 进程内内存计数的速率限制（per-isolate，非全局）。
// Cloudflare 每个边缘 isolate 各自计数，作为反滥用够用。
// 真要全局精确得用 Cloudflare Rate Limiting binding 或 D1 计数表。

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean, retryAfter: number } {
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }
  bucket.count++

  // 当 buckets 长大到一定规模时随机扫一次清掉过期项，避免内存无限增长
  if (buckets.size > 1000 && Math.random() < 0.01) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k)
    }
  }

  return {
    ok: bucket.count <= limit,
    retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
  }
}
