import * as React from 'react'
import { Button, Icon } from 'antd'
import styled from 'styled-components'
import { ZoomingButtonLink } from '../components/ZoomingButtonLink'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PlaylistItem } from '../components/PlaylistItem'
import { Context } from '../contexts/UserContext'
import { Link } from 'react-router-dom'

export default function HomeScreen() {
  const { user, setUser } = React.useContext(Context)

  const isEmpty = user!.playlistConfigs.length === 0

  const updatePlaylistForUser = (playlist: PlaylistConfig) => {
    const idx = user!.playlistConfigs
      .findIndex(({ id }: PlaylistConfig) => id === playlist.id)
    user!.playlistConfigs[idx] = playlist
    setUser(user)
  }

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
          <ZoomingButtonLink to="/playlists/new">
            <Icon type="plus"/> Create New Playlist
          </ZoomingButtonLink>
        </>
      )}

      <PlaylistGrid>
        {user!.playlistConfigs.map((playlistConfig: PlaylistConfig) =>
          <PlaylistItem
            key={playlistConfig.id}
            playlist={playlistConfig}
            onChangeStatus={updatePlaylistForUser}
            onUpdate={updatePlaylistForUser}
          />
        )}
        {!isEmpty && (
          <AddPlaylistGridItem to="/playlists/new">
            <Icon type="plus"/>&nbsp;Create New Playlist
          </AddPlaylistGridItem>
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

const AddPlaylistGridItem = styled(Link)`
  width: 100%;
  padding: 12px;
  border: 2px dashed gray;
  color: gray;
  border-radius: 6px;
  background-color: #030607;
  transition: all 200ms;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.0125);
    border-color: #1DA57A;
    color: #1DA57A;
    opacity: 1;
  }
`
