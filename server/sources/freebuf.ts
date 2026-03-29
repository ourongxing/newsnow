export default defineSource(async () => {
  const data = await rss2json("https://www.freebuf.com/feed")
  if (!data?.items.length) return []
  return data.items.map(item => ({
    id: item.link,
    title: item.title,
    url: item.link,
    pubDate: item.created,
    extra: {
      hover: item.description,
    },
  }))
})
