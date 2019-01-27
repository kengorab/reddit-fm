import * as React from 'react'
import { Icon } from 'antd'
import { ZoomingButtonLink } from '../components/ZoomingButtonLink'

type Props = { user: User }

export default function HomeScreen(props: Props) {
  return (
    <>
      <h1>Your Curated Playlists</h1>
      {props.user.playlistConfigs.length === 0 && (
        <p>
          It looks like you don't have any curated playlists set up!<br/>
          Let's try making one! Click the button below
        </p>
      )}
      <ZoomingButtonLink to="/playlists/new">
        <Icon type="plus"/> Create New Playlist
      </ZoomingButtonLink>
    </>
  )
}
