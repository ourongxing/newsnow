type Res = {
  description: string
  link: string
  // Date
  pubDate: string
  publisher: string
  title: string
}[]
export default defineSource(async () => {
  const res = await Promise.all(["https://kaopustorage.blob.core.windows.net/jsondata/news_list_beta_hans_0.json", "https://kaopustorage.blob.core.windows.net/jsondata/news_list_beta_hans_1.json"].map(url => myFetch(url) as Promise<Res>))
  return res.flat().filter(k => ["财新", "公视"].every(h => k.publisher !== h)).map((k) => {
    return {
      id: k.link,
      title: k.title,
      pubDate: k.pubDate,
      extra: {
        hover: k.description,
        info: k.publisher,
      },
      url: k.link,
    }
  })
},
)
