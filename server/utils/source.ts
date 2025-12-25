import process from "node:process"
import type { AllSourceID } from "@shared/types"
import defu from "defu"
import type { RSSHubOption, RSSHubInfo as RSSHubResponse, SourceGetter, SourceOption } from "#/types"

type R = Partial<Record<AllSourceID, SourceGetter>>
export function defineSource(source: SourceGetter): SourceGetter
export function defineSource(source: R): R
export function defineSource(source: SourceGetter | R): SourceGetter | R {
  return source
}

export function defineRSSSource(url: string, option?: SourceOption): SourceGetter {
  return async () => {
    const data = await rss2json(url)
    if (!data?.items.length) throw new Error("Cannot fetch rss data")
    return data.items.map(item => ({
      title: item.title,
      url: item.link,
      id: item.link,
      pubDate: !option?.hiddenDate ? item.created : undefined,
    }))
  }
}

export function defineRSSHubSource(route: string, RSSHubOptions?: RSSHubOption, sourceOption?: SourceOption): SourceGetter {
  return async () => {
    // "https://rsshub.pseudoyu.com"
    const RSSHubBase = "https://rsshub.rssforever.com"
    const url = new URL(route, RSSHubBase)
    url.searchParams.set("format", "json")
    RSSHubOptions = defu<RSSHubOption, RSSHubOption[]>(RSSHubOptions, {
      sorted: true,
    })

    Object.entries(RSSHubOptions).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString())
    })
    const data: RSSHubResponse = await myFetch(url)
    return data.items.map(item => ({
      title: item.title,
      url: item.url,
      id: item.id ?? item.url,
      pubDate: !sourceOption?.hiddenDate ? item.date_published : undefined,
    }))
  }
}

export function proxySource(proxyUrl: string, source: SourceGetter) {
  return process.env.CF_PAGES
    ? defineSource(async () => {
        const data = await myFetch(proxyUrl)
        return data.items
      })
    : source
}

/**
 * 根据URL的生成固定长度哈希ID
 * @param url - 原始URL字符串
 * @param options - 配置选项
 * @param options.length - 返回的ID长度（默认32）
 * @returns 固定长度的哈希字符串
 */
export async function generateUrlHashId(url: string, options: { length?: number } = {}): Promise<string> {
  const { length = 32 } = options

  // 1. 规范化URL（关键步骤，确保相同页面的不同URL变体能生成相同ID）
  const normalizedUrl = normalizeUrl(url)

  // 2. 根据"SHA-256"算法调用你的加密函数
  const fullHash: string = await myCrypto(normalizedUrl, "SHA-256")

  // 3. 截取指定长度
  // 注意：MD5固定32位，SHA-1固定40位，SHA-256固定64位，截取不会影响唯一性
  return fullHash.substring(0, length)
}

/**
 * URL规范化函数（根据你的业务需求调整）
 * 目的是将同一网页的不同URL形式统一，确保生成相同的哈希ID
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)

    // 统一协议和主机名大小写
    urlObj.protocol = urlObj.protocol.toLowerCase()
    urlObj.hostname = urlObj.hostname.toLowerCase()

    // 移除URL末尾的斜杠（可选，根据你的需求）
    urlObj.pathname = urlObj.pathname.replace(/\/$/, "")

    // 对查询参数按名称排序（使?a=1&b=2和?b=2&a=1产生相同结果）
    urlObj.searchParams.sort()

    // 移除特定的跟踪参数（如UTM参数，这些不影响页面内容）
    const paramsToRemove = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ]
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param))

    // 返回规范化后的完整URL
    return urlObj.toString()
  } catch (error) {
    // 如果URL不合法（如相对URL或格式错误），返回原始字符串或进行其他处理
    console.warn(`URL规范化失败，使用原始URL: ${url}`, error)
    return url
  }
}
