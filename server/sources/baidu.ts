import { generateUrlHashId } from "#/utils/source.ts"

interface Res {
  data: {
    cards: {
      content: {
        isTop?: boolean
        word: string
        rawUrl: string
        desc?: string
      }[]
    }[]
  }
}

export default defineSource(async () => {
  const rawData: string = await myFetch(`https://top.baidu.com/board?tab=realtime`)
  const jsonStr = (rawData as string).match(/<!--s-data:(.*?)-->/s)
  const data: Res = JSON.parse(jsonStr![1])

  // 使用 Promise.all并行化处理提升generateUrlHashId函数的哈希性能
  return await Promise.all(
    data.data.cards[0].content
      .filter(k => !k.isTop)
      .map(async (k) => {
        // 使用 generateUrlHashId 生成news id
        const hashId = await generateUrlHashId(k.rawUrl)

        return {
          id: hashId, // 使用生成的哈希作为唯一ID
          title: k.word,
          url: k.rawUrl,
          extra: {
            hover: k.desc,
          },
        }
      }),
  )
})
