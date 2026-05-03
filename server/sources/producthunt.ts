import process from "node:process"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const apiToken = process.env.PRODUCTHUNT_API_TOKEN
  if (!apiToken) {
    console.warn("[producthunt] PRODUCTHUNT_API_TOKEN is not set")
    return []
  }
  const token = `Bearer ${apiToken}`

  const query = `
    query {
      posts(first: 30, order: RANKING) {
        edges {
          node {
            id
            name
            tagline
            votesCount
            url
            slug
          }
        }
      }
    }
  `

  const response: any = await myFetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": "https://www.producthunt.com",
    },
    body: JSON.stringify({ query }),
  })

  if (!response?.data?.posts?.edges) {
    console.warn("[producthunt] Unexpected API response:", JSON.stringify(response).slice(0, 200))
    return []
  }

  const news: NewsItem[] = []
  const posts = response.data.posts.edges

  for (const edge of posts) {
    const post = edge.node
    if (post.id && post.name) {
      news.push({
        id: post.id,
        title: post.name,
        url: post.url || `https://www.producthunt.com/posts/${post.slug}`,
        extra: {
          info: ` △︎ ${post.votesCount || 0}`,
          hover: post.tagline,
        },
      })
    }
  }

  return news
})
