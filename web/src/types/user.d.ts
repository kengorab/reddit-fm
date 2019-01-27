// These are copied from api/types/users.d.ts, should probably be made accessible sans copy-pasta
type Interval = 'daily' | 'weekly'

interface PlaylistConfig {
  name: string,
  subreddits: string[],
  updateInterval: Interval,
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
