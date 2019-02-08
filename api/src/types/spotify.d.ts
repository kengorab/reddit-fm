interface Track {
  id: string,
  album: {
    id: string,
    name: string,
    release_date: string,
    images: Array<{ height: number, width: number, url: string }>
  },
  artists: Array<{ id: string, name: string }>,
  name: string,
  uri: string,
  external_urls: { spotify: string }
}

interface SearchResponse {
  tracks: {
    total: number,
    items: Track[]
  }
}

interface Playlist {
  collaborative: boolean,
  external_urls: any,
  href: string,
  id: string,
  images: any[],
  name: string,
  owner: {
    display_name: string,
    external_urls: any,
    href: string,
    id: string,
    uri: string,
  },
  public: boolean,
  snapshot_id: string,
  tracks: {
    total: number,
  },
  uri: string,
}

interface PlaylistsResponse {
  items: Playlist[],
  total: number,
}

interface SpotifyUser {
  country: string,
  display_name: string,
  external_urls: any,
  followers: any,
  href: string,
  id: string,
  images: any[],
  product: string,
  type: string,
  uri: string,
}
