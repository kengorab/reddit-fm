import 'isomorphic-fetch'

export async function search(token: string, query: string): Promise<SearchResponse> {
  const q = encodeURIComponent(query)
  const url = `https://api.spotify.com/v1/search?type=track&market=US&limit=1&q=${q}`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return res.json()
}

export async function getPlaylists(user: User): Promise<PlaylistsResponse> {
  const url = 'https://api.spotify.com/v1/me/playlists'
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.spotifyToken}`
    }
  })
  return res.json()
}

export async function getPlaylistTracks(user: User, playlist: Playlist): Promise<Track[]> {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.spotifyToken}`
    }
  })
  const json = await res.json()
  return json.items.map(item => item.track)
}

export async function addSongsToPlaylist(user: User, playlist: Playlist, songUris: string[]) {
  const uris = songUris.join(',')
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?uris=${uris}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.spotifyToken}`
    }
  })
  console.log(await res.json())
}

export async function createPlaylist(
  user: User,
  name: string,
  description: string,
  isPublic: boolean
): Promise<Playlist> {
  const url = 'https://api.spotify.com/v1/me/playlists'
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      'public': isPublic
    }),
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.spotifyToken}`
    }
  })
  return res.json()
}
