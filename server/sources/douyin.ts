import { $fetch } from "ofetch"
import { defineSource } from "../utils/source" // Add explicit import
import { myFetch } from "../utils/fetch"
// Add explicit import
interface Res {
  data: {
    word_list: {
      sentence_id: string
      word: string
      event_time: string
      hot_value: string
    }[]
  }
} // Add explicit import for direct use

export default defineSource(async () => {
  const url = "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1"
  const cookie = (await $fetch.raw("https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383")).headers.getSetCookie()
  const res: Res = await myFetch(url, {
    headers: {
      cookie: cookie.join("; "),
    },
  })
  return res.data.word_list.map((k) => {
    return {
      id: k.sentence_id,
      title: k.word,
      url: `https://www.douyin.com/hot/${k.sentence_id}`,
    }
  })
})
