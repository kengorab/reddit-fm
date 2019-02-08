// These are copied from api/types/users.d.ts, should probably be made accessible sans copy-pasta
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

// This is the User interface from users.d.ts, but with user-identifying information omitted
interface User {
  id: string,
  spotifyDisplayName: string,
  playlistConfigs: PlaylistConfig[],
}

// This is copied from the api's pipeline.ts
interface Song {
  id: string,
  uri: string,
  name: string,
  album: string,
  artist: string,
  albumArt: string,
  url: string
}

