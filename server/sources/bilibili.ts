import dayjs from "dayjs/esm"

interface WapRes {
  code: number
  exp_str: string
  list: {
    hot_id: number
    keyword: string
    show_name: string
    score: number
    word_type: number
    goto_type: number
    goto_value: string
    icon: string
    live_id: any[]
    call_reason: number
    heat_layer: string
    pos: number
    id: number
    status: string
    name_type: string
    resource_id: number
    set_gray: number
    card_values: any[]
    heat_score: number
    stat_datas: {
      etime: string
      stime: string
      is_commercial: string
    }
  }[]
  top_list: any[]
  hotword_egg_info: string
  seid: string
  timestamp: number
  total_count: number
}

// Interface for Bilibili Hot Video response
interface HotVideoRes {
  code: number
  message: string
  ttl: number
  data: {
    list: {
      aid: number
      videos: number
      tid: number
      tname: string
      copyright: number
      pic: string
      title: string
      pubdate: number
      ctime: number
      desc: string
      state: number
      duration: number
      owner: {
        mid: number
        name: string
        face: string
      }
      stat: {
        view: number
        danmaku: number
        reply: number
        favorite: number
        coin: number
        share: number
        now_rank: number
        his_rank: number
        like: number
        dislike: number
      }
      dynamic: string
      cid: number
      dimension: {
        width: number
        height: number
        rotate: number
      }
      short_link: string
      short_link_v2: string
      bvid: string
      rcmd_reason: {
        content: string
        corner_mark: number
      }
    }[]
  }
}

const hotSearch = defineSource(async () => {
  const url = "https://s.search.bilibili.com/main/hotword?limit=30"
  const res: WapRes = await myFetch(url)

  return res.list.map(k => ({
    id: k.keyword,
    title: k.show_name,
    url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(k.keyword)}`,
    extra: {
      icon: k.icon && proxyPicture(k.icon),
    },
  }))
})

const hotVideo = defineSource(async () => {
  const url = "https://api.bilibili.com/x/web-interface/popular"
  const res: HotVideoRes = await myFetch(url)

  return res.data.list.map(video => ({
    id: video.bvid,
    title: video.title,
    url: `https://www.bilibili.com/video/${video.bvid}`,
    pubDate: video.pubdate * 1000,
    extra: {
      info: `${video.owner.name} · ${formatNumber(video.stat.view)}观看 · ${formatNumber(video.stat.like)}点赞`,
      hover: video.desc,
      icon: proxyPicture(video.pic),
    },
  }))
})

const ranking = defineSource(async () => {
  const url = "https://api.bilibili.com/x/web-interface/ranking/v2"
  const res: HotVideoRes = await myFetch(url)

  return res.data.list.map(video => ({
    id: video.bvid,
    title: video.title,
    url: `https://www.bilibili.com/video/${video.bvid}`,
    pubDate: video.pubdate * 1000,
    extra: {
      info: `${video.owner.name} · ${formatNumber(video.stat.view)}观看 · ${formatNumber(video.stat.like)}点赞`,
      hover: video.desc,
      icon: proxyPicture(video.pic),
    },
  }))
})

interface AnimeItem {
  date: string
  date_ts: number
  day_of_week: number
  episodes: any[]
  is_today: number
}

interface AnimeRes {
  code: number
  message: string
  result: AnimeItem[]
}

const animeToday = defineSource(async () => {
  // bilibili番剧的API
  const animeUrl = "https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6"
  // bilibili国创的API
  const guochuangUrl = "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6"
  // 并发请求
  const [animeRes, guochuangRes] = await Promise.all([
    myFetch<AnimeRes>(animeUrl, {
      headers: {
        "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Referer": "https://www.bilibili.com/",
      },
    }),
    myFetch<AnimeRes>(guochuangUrl, {
      headers: {
        "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Referer": "https://www.bilibili.com/",
      },
    }),
  ])

  // 合并返回的数据
  const combined = [...animeRes?.result, ...guochuangRes?.result]

  // 找到今天更新的的番剧
  const todayUpdateEpisodes = combined?.filter(val => val?.is_today === 1)

  // 合并国创和番剧的数据
  const mergedTodayEpisodesWithDate = todayUpdateEpisodes.flatMap(item =>
    item.episodes.map(ep => ({ ...ep, date: item.date })),
  )
  const now = dayjs() // 当前时间

  return mergedTodayEpisodesWithDate
    .filter((video) => {
      // 如果 pub_ts 不存在也过滤掉
      if (!video?.pub_ts) return false
      // 过滤掉未来的时间
      return dayjs(video.pub_ts * 1000).isBefore(now) || dayjs(video.pub_ts * 1000).isSame(now)
    })
    .map((video) => {
      const fullUrl = `https://www.bilibili.com/bangumi/play/ep${video?.episode_id}`
      const readable = dayjs(video?.pub_ts * 1000).format("YYYY-MM-DD HH:mm:ss")
      return {
        id: `ep${video?.episode_id}`,
        title: video?.title,
        url: fullUrl,
        pubDate: readable,
        extra: {
          info: `${video?.date} ${video?.pub_time}更新 更新至${video?.pub_index}`,
          hover: video?.desc,
          icon: proxyPicture(video?.square_cover ?? video?.cover),
        },
      }
    })
})

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${Math.floor(num / 10000)}w+`
  }
  return num.toString()
}

export default defineSource({
  "bilibili": hotSearch,
  "bilibili-hot-search": hotSearch,
  "bilibili-hot-video": hotVideo,
  "bilibili-ranking": ranking,
  "bilibili-anime-today": animeToday,
})
