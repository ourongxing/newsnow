interface Res {
  data: {
    title: string
    hot: string
    url: string
    mobil_url: string
  }[]
}

export default defineSource(async () => {
  const r: Res = await myFetch(`https://api.vvhan.com/api/hotlist/huPu`)
  return r.data.map((k) => {
    return {
      id: k.url,
      title: k.title,
      url: k.url,
      mobileUrl: k.mobil_url,
    }
  })
})
