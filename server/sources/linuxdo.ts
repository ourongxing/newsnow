interface Res {
  topic_list: {
    can_create_topic: boolean
    more_topics_url: string
    per_page: number
    top_tags: string[]
    topics: {
      id: number
      title: string
      fancy_title: string
      posts_count: number
      reply_count: number
      highest_post_number: number
      image_url: null | string
      created_at: Date
      last_posted_at: Date
      bumped: boolean
      bumped_at: Date
      unseen: boolean
      pinned: boolean
      excerpt?: string
      visible: boolean
      closed: boolean
      archived: boolean
      like_count: number
      has_summary: boolean
      last_poster_username: string
      category_id: number
      pinned_globally: boolean
    }[]
  }
}

const hot = defineSource(async () => {
  const res = await myFetch<Res>("https://linux.do/top/daily.json")
  return res.topic_list.topics
    .filter(k => k.visible && !k.archived && !k.pinned)
    .map(k => ({
      id: k.id,
      title: k.title,
      url: `https://linux.do/t/topic/${k.id}`,
    }))
})

const latest = defineSource(async () => {
  const res = await myFetch<Res>("https://linux.do/latest.json?order=created")
  return res.topic_list.topics
    .filter(k => k.visible && !k.archived && !k.pinned)
    .map(k => ({
      id: k.id,
      title: k.title,
      pubDate: new Date(k.created_at).valueOf(),
      url: `https://linux.do/t/topic/${k.id}`,
    }))
})

export default defineSource({
  "linuxdo": latest,
  "linuxdo-latest": latest,
  "linuxdo-hot": hot,
})
