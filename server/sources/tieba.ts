import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

interface Res {
  data: {
    bang_topic: {
      topic_list: {
        topic_id: string
        topic_name: string
        create_time: number
        topic_url: string

      }[]
    }
  }
}

export default defineSource(async () => {
  const url = "https://tieba.baidu.com/hottopic/browse/topicList"
  const res: Res = await myFetch(url)
  return res.data.bang_topic.topic_list
    .map((k) => {
      return {
        id: k.topic_id,
        title: k.topic_name,
        url: k.topic_url,
      }
    })
})
