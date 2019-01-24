import 'isomorphic-fetch'

export class SpotifyApi {
  private readonly baseUrl = 'https://api.spotify.com'
  private readonly headers: any

  constructor(private token: string) {
    this.headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async getMe(): Promise<SpotifyUser> {
    const url = `${this.baseUrl}/v1/me`
    const res = await fetch(url, { headers: this.headers })
    return res.json()
  }

  async search(query: string): Promise<SearchResponse> {
    const q = encodeURIComponent(query)
    const url = `${this.baseUrl}/v1/search?type=track&market=US&limit=1&q=${q}`
    const res = await fetch(url, { headers: this.headers })
    return res.json()
  }

  async getPlaylists(): Promise<PlaylistsResponse> {
    const url = `${this.baseUrl}/v1/me/playlists`
    const res = await fetch(url, { headers: this.headers })
    return res.json()
  }

  async getPlaylistTracks(playlist: Playlist): Promise<Track[]> {
    const url = `${this.baseUrl}/v1/playlists/${playlist.id}/tracks`
    const res = await fetch(url, { headers: this.headers })
    const json = await res.json()
    return json.items.map(item => item.track)
  }

  async addSongsToPlaylist(playlist: Playlist, songUris: string[]) {
    const uris = songUris.join(',')
    const url = `${this.baseUrl}/v1/playlists/${playlist.id}/tracks?uris=${uris}`
    const res = await fetch(url, { method: 'POST', headers: this.headers })
    console.log(await res.json())
  }

  async createPlaylist(name: string, description: string, isPublic: boolean): Promise<Playlist> {
    const url = `${this.baseUrl}/v1/me/playlists`
    const body = JSON.stringify({
      name,
      description,
      'public': isPublic
    })
    const res = await fetch(url, { method: 'POST', body, headers: this.headers })
    return res.json()
  }
}
