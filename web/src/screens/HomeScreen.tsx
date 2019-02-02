import * as React from 'react'
import { Icon } from 'antd'
import styled from 'styled-components'
import { ZoomingButtonLink } from '../components/ZoomingButtonLink'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PlaylistItem } from '../components/PlaylistItem'

type Props = {
  user: User
  onUpdateUser: (user: User) => void
}

export default function HomeScreen(props: Props) {
  const isEmpty = props.user.playlistConfigs.length === 0

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }]}/>

      <h1>Your Curated Playlists</h1>
      {isEmpty && (
        <>
          <p>
            It looks like you don't have any curated playlists set up!<br/>
            Let's try making one! Click the button below
          </p>
          <ZoomingButtonLink to='/playlists/new'>
            <Icon type='plus'/> Create New Playlist
          </ZoomingButtonLink>
        </>
      )}

      <PlaylistGrid>
        {props.user.playlistConfigs.map(playlistConfig =>
          <PlaylistItem
            key={playlistConfig.id}
            playlist={playlistConfig}
            onChangeStatus={(playlist) => {
              const idx = props.user.playlistConfigs
                .findIndex(({ id }) => id === playlist.id)
              props.user.playlistConfigs[idx] = playlist
              props.onUpdateUser(props.user)
            }}
          />
        )}
      </PlaylistGrid>
    </>
  )
}

const PlaylistGrid = styled.div`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 1fr 1fr;
  background-color: inherit;
`
