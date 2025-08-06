interface Report {
  id: string
  type: number
  time: string
  important: number
  data: {
    content: string
    pic: string
    title: string
  }
  remark: string[]
  hot: boolean
  hot_start: string
  hot_end: string
  classify: {
    id: number
    pid: number
    name: string
    parent: string
  }[]
}

interface Res {
  data: {
    id: number
    name: string
    pid: number
    child: {
      id: number
      name: string
      pid: number
      flash_list: Report[]
    }[]
  }[]
}

const flash = defineSource(async () => {
  const res: Res = await myFetch("https://api.mktnews.net/api/flash/host")

  const categories = ["policy", "AI", "financial"] as const
  const typeMap = { policy: "Policy", AI: "AI", financial: "Financial" } as const

  const allReports = categories.flatMap((category) => {
    const flash_list = res.data.find(item => item.name === category)?.child[0]?.flash_list || []
    return flash_list.map(item => ({ ...item, type: typeMap[category] }))
  })

  return allReports
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(item => ({
      id: item.id,
      title: item.data.title || item.data.content,
      pubDate: item.time,
      extra: { info: item.type },
      url: `https://mktnews.net/flashDetail.html?id=${item.id}`,
    }))
})

export default defineSource({
  "mktnews": flash,
  "mktnews-flash": flash,
})
