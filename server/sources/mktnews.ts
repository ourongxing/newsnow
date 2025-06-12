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

interface Child {
  id: number
  name: string
  pid: number
  flash_list: Report[]
}

interface Res {
  data: {
    id: number
    name: string
    pid: number
    child: Child[]
  }
}

const policy = defineSource(async () => {
  const res: Res = await myFetch("https://api.mktnews.net/api/flash/host")
  const flashList = res.data.child.filter(item => item.id === 1000)[0]?.flash_list || []
  return flashList.map((item) => {
    const url = `https://mktnews.net/flashDetail.html?id=${item.id}`
    return {
      id: item.id,
      title: item.data.title || item.data.content,
      url,
    }
  })
})

const AI = defineSource(async () => {
  const res: Res = await myFetch("https://api.mktnews.net/api/flash/host")
  const flashList = res.data.child.filter(item => item.id === 2000)[0]?.flash_list || []
  return flashList.map((item) => {
    const url = `https://mktnews.net/flashDetail.html?id=${item.id}`
    return {
      id: item.id,
      title: item.data.title || item.data.content,
      url,
    }
  })
})

const financial = defineSource(async () => {
  const res: Res = await myFetch("https://api.mktnews.net/api/flash/host")
  const flashList = res.data.child.filter(item => item.id === 3000)[0]?.flash_list || []
  return flashList.map((item) => {
    const url = `https://mktnews.net/flashDetail.html?id=${item.id}`
    return {
      id: item.id,
      title: item.data.title || item.data.content,
      url,
    }
  })
})

export default defineSource({
  "mktnews": policy,
  "mktnews-policy": policy,
  "mktnews-AI": AI,
  "mktnews-financial": financial,
})
