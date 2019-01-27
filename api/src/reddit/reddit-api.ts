import 'isomorphic-fetch'

const getUrl = (sub: string) => `https://reddit.com/r/${sub}.json`

export async function getSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  const url = getUrl(subreddit)
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Typescript music-discovery bot v1.0'
    }
  })
  const json = await res.json()
  return json.data.children.map(child => child.data)
}

export async function subredditExists(subreddit: string): Promise<boolean> {
  const url = getUrl(subreddit.replace('/r/', ''))
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Typescript music-discovery bot v1.0'
    }
  })

  return res.ok
}
