interface Media {
  type: string,
  oembed: {
    provider_url: string,
    version: string,
    title: string,
    type: string,
    thumbnail_width: number,
    height: number,
    width: number,
    html: string,
    author_name: string,
    thumbnail_height: number,
    thumbnail_url: string,
    provider_name: string,
    author_url: string,
  }
}

interface RedditPost {
  title: string,
  url: string,
  secure_media: Media | null,
  media: Media | null,
}


