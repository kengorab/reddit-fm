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
