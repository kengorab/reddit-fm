import * as auth from './auth'
import { backendBase } from '../env'

export async function triggerManualUpdate(playlist: PlaylistConfig): Promise<SingleResult> {
  const id = auth.getUserId()
  const url = `${backendBase}/users/${id}/playlists/${playlist.id}/songs/updates`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(playlist)
  })
  return res.json()
}
