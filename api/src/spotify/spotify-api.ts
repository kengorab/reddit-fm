import 'isomorphic-fetch'
import * as env from '../env'
import { encode } from '../utils/base64'

export class SpotifyApi {
  private readonly baseUrl = 'https://api.spotify.com'

  constructor(private accessToken: string, private refreshToken: string) {

  }

  get headers() {
    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`
    }
  }

  async initialize(): Promise<{ accessToken: string, changed: boolean }> {
    const url = `${this.baseUrl}/v1/me`
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) {
      console.log('Token expired, refreshing...')
      this.accessToken = await this.handleTokenRefresh()
      console.log('Token refreshed')
      return { accessToken: this.accessToken, changed: true }
    }

    return { accessToken: this.accessToken, changed: false }
  }

  private async handleTokenRefresh() {
    const url = 'https://accounts.spotify.com/api/token'
    const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(this.refreshToken)}`
    const auth = encode(env.spotifyClientId + ':' + env.spotifyClientSecret)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body
    })
    const { access_token: accessToken } = await res.json()
    return accessToken
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

  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    const url = `${this.baseUrl}/v1/playlists/${playlistId}`
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) {
      throw new Error(`No playlist for id ${playlistId}`)
    }
    try {
      return res.json()
    } catch (e) {
      console.error(e)
      console.log(await res.text())
      return null
    }
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
    console.log(await res.text())
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
