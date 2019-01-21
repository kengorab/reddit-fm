type Interval = 'daily' | 'weekly'

interface PlaylistConfig {
  name: string,
  subreddits: string[],
  updateInterval: Interval,
  created: number,
  lastFetched: number | null,
  maxToAdd?: number,
  shuffle?: boolean,
  isPublic?: boolean,
}

interface User {
  id: string,
  spotifyToken: string,
  playlistConfigs: PlaylistConfig[],
}
