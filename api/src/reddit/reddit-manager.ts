const acceptableMediaTypes = ['youtube.com']

export function getYoutubeVideos(posts: RedditPost[]) {
  return posts
    .filter(post => post.secure_media || post.media)
    .filter(post => {
      const media = post.secure_media || post.media
      return acceptableMediaTypes.includes(media.type)
    })
    .map(post => {
        const media = post.secure_media || post.media
        return {
          title: post.title,
          url: post.url,
          videoTitle: media.oembed.title
        }
      }
    )
}
