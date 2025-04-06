import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"
import { proxyPicture } from "../utils/proxy"

interface Res {
  data: {
    ClusterIdStr: string
    Title: string
    HotValue: string
    Image: {
      url: string
    }
    LabelUri?: {
      url: string
    }
  }[]
}

export default defineSource(async () => {
  const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc"
  const res: Res = await myFetch(url)
  return res.data
    .map((k) => {
      return {
        id: k.ClusterIdStr,
        title: k.Title,
        url: `https://www.toutiao.com/trending/${k.ClusterIdStr}/`,
        extra: {
          icon: k.LabelUri?.url && proxyPicture(k.LabelUri.url, "encodeBase64URL"),
        },
      }
    })
})
