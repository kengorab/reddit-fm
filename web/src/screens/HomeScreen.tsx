import * as React from 'react'
import { Icon } from 'antd'
import styled from 'styled-components'
import { ZoomingButtonLink } from '../components/ZoomingButtonLink'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PlaylistItem } from '../components/PlaylistItem'
import { Context } from '../contexts/UserContext'

export default function HomeScreen() {
  const { user, setUser } = React.useContext(Context)

  const isEmpty = user!.playlistConfigs.length === 0

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
        {user!.playlistConfigs.map((playlistConfig: PlaylistConfig) =>
          <PlaylistItem
            key={playlistConfig.id}
            playlist={playlistConfig}
            onChangeStatus={(playlist) => {
              const idx = user!.playlistConfigs
                .findIndex(({ id }: PlaylistConfig) => id === playlist.id)
              user!.playlistConfigs[idx] = playlist
              setUser(user)
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
  grid-template-columns: 1fr 1fr 1fr;
  background-color: inherit;
  
  @media screen and (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`
