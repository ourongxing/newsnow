import { encodeBase64URL } from "./base64"

export function proxyPicture(url: string, type: "encodeURIComponent" | "encodeBase64URL" = "encodeURIComponent") {
  const encoded = type === "encodeBase64URL" ? encodeBase64URL(url) : encodeURIComponent(url)
  return `/api/proxy/img.png?type=${type}&url=${encoded}`
}
