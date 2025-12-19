// 定义 GamerPower 返回的数据结构
interface GamerPowerItem {
  id: number
  title: string
  worth: string // 原价，例如 "$29.99"
  thumbnail: string // 缩略图 URL
  description: string
  open_giveaway_url: string // 领取链接
  published_date: string
  platforms: string // 平台，例如 "PC, Steam"
  end_date: string // 截止日期
}

export default defineSource(async () => {
  // 调用 GamerPower 的公开 API
  // 参数 platform=pc 表示只看电脑游戏，type=game 表示只看完整游戏
  const url = "https://www.gamerpower.com/api/giveaways?platform=pc&type=game&sort-by=popularity"

  const response = await fetch(url)
  const data: GamerPowerItem[] = await response.json()

  // 转换为 newsnow 需要的格式
  return data.map(item => ({
    id: item.id.toString(),
    title: `[${item.platforms}] ${item.title} (原价 ${item.worth})`,
    url: item.open_giveaway_url,
    mobileUrl: item.open_giveaway_url,
    pubDate: item.published_date,
    extra: {
      info: item.end_date !== "N/A" ? `截止: ${item.end_date}` : "长期有效",
    },
  }))
})
