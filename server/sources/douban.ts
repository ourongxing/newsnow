interface HotMoviesRes {
  category: string
  tags: []
  items: MovieItem[]
  recommend_tags: []
  total: number
  type: string
}

interface MovieItem {
  rating: {
    count: number
    max: number
    star_count: number
    value: number
  }
  title: string
  pic: {
    large: string
    normal: string
  }
  is_new: boolean
  uri: string
  episodes_info: string
  card_subtitle: string
  type: string
  id: string
}

export default defineSource(async () => {
  const baseURL = "https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie"
  const res: HotMoviesRes = await myFetch(baseURL, {
    headers: {
      Referer: "https://movie.douban.com/",
      Accept: "application/json, text/plain, */*",
    },
  })
  return res.items.map(movie => ({
    id: movie.id,
    title: `《${movie.title}》${movie.card_subtitle}`,
    url: `https://movie.douban.com/subject/${movie.id}`,
    extra: {
      hover: movie.card_subtitle,
    },
  }))
})
