export default defineSource(async () => {
  const url = "https://60s.viki.moe/v2/dongchedi"

  try {
    const response = await myFetch(url)
    const data = response.data

    if (!data || !Array.isArray(data)) {
      throw new Error("Failed to fetch dongchedi hot search data: invalid response format")
    }

    const hotNews: NewsItem[] = data.map(item => ({
      id: item.rank.toString(),
      title: item.title,
      url: item.url,
      mobileUrl: item.url,
      extra: {
        score: item.score_desc,
      },
    }))

    return hotNews
  } catch (error) {
    console.error("Error fetching dongchedi hot search data:", error)
    throw error
  }
})
