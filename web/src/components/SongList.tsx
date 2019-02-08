import * as React from 'react'
import styled from 'styled-components'

interface Props {
  songs: Song[]
}

export function SongList(props: Props) {
  return (
    <div>
      {props.songs.map(song =>
        <SongListItem key={song.id} song={song}/>
      )}
    </div>
  )
}

interface SongListItemProps {
  song: Song
}

function SongListItem({ song }: SongListItemProps) {
  return (
    <SongListItemWrapper>
      <img src={song.albumArt} alt={song.album}/>
      <article>
        <b>{song.name}</b>
        <span>{song.artist}</span>
        <em>{song.album}</em>

        <aside>
          <a href={song.url} target="_blank">
            <i className="fab fa-spotify"/> Listen on Spotify
          </a>
        </aside>
      </article>
    </SongListItemWrapper>
  )
}

const SongListItemWrapper = styled.div`
  display: flex;
  padding-bottom: 12px;
  
  &:not(:last-child) {
    margin-bottom: 12px;
    border-bottom: 1px solid #757677;
  }
  
  img {
    width: 150px;
    height: 150px;
  }
  
  article {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-evenly;
    padding: 20px;
  }
  
  aside {
    text-align: end;
  }
  
  @media screen and (max-width: 800px) {
    img {
      width: 100px;
      height: 100px;
    }
    
    article {
      padding: 0 12px;
    }
    
    aside {
      display: none;
    }
  }
`
