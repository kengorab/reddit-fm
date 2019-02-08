type Interval = 'daily' | 'weekly'

interface PlaylistConfig {
  id?: string,
  name: string,
  subreddits: string[],
  updateInterval: Interval,
  enabled: boolean,
  created?: number,
  lastFetched?: number | null,
  maxToAdd?: number,
  shuffle?: boolean,
  isPublic?: boolean,
}

interface User {
  id: string,
  spotifyRefreshToken: string,
  spotifyAccessToken: string,
  spotifyId: string,
  spotifyDisplayName: string,
  playlistConfigs: PlaylistConfig[],
}
