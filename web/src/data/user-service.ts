import * as auth from './auth'
import { backendBase } from '../env'

export async function getUser(): Promise<User | null> {
  const id = auth.getUserId()
  const url = `${backendBase}/users/${id}`

  const res = await fetch(url)
  return res.json()
}

export async function createPlaylist(playlist: PlaylistConfig): Promise<CreatePlaylistResponse> {
  const id = auth.getUserId()
  const url = `${backendBase}/users/${id}/playlists`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(playlist)
  })
  return res.json()
}

export async function setPlaylistStatus(
  playlistId: string,
  status: boolean
): Promise<PlaylistConfig> {
  const method = status ? 'POST' : 'DELETE'

  const userId = auth.getUserId()
  const url = `${backendBase}/users/${userId}/playlists/${playlistId}/status`

  const res = await fetch(url, {
    method,
    body: ''
  })
  return res.json()
}

export async function getPlaylistSongs(
  subreddits: string[],
  maxToAdd: number
): Promise<{ songs: Song[] }> {
  const userId = auth.getUserId()
  const url = `${backendBase}/users/${userId}/playlists/songs`
  const query = Object.entries({ subreddits: subreddits.join(','), maxToAdd })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v.toString())}`)
    .join('&')

  const res = await fetch(`${url}?${query}`)
  return res.json()
}
