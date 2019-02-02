import * as React from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { Switch, Tag } from 'antd'
import * as UserService from '../data/user-service'

interface Props {
  playlist: PlaylistConfig
  onChangeStatus: (playlist: PlaylistConfig) => void
}

interface State {
  statusChangeLoading: boolean
}

export class PlaylistItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { statusChangeLoading: false }
  }

  toggleEnabled = async (playlistId: string, enabled: boolean) => {
    this.setState({ statusChangeLoading: true })
    const updatedPlaylist = await UserService.setPlaylistStatus(playlistId, enabled)
    this.props.onChangeStatus(updatedPlaylist)
    this.setState({ statusChangeLoading: false })
  }

  renderNextRun = (playlist: PlaylistConfig) => {
    const { lastFetched, updateInterval, enabled } = playlist
    if (lastFetched) {
      const lastFetchedMessage: string = (dayjs(lastFetched) as any).fromNow()
      const nextUpdate = dayjs(lastFetched)
        .add(1, updateInterval === 'weekly' ? 'week' : 'day')
      const nextUpdateMessage: string = nextUpdate.isBefore(dayjs())
        ? 'very soon'
        : (dayjs() as any).to(nextUpdate)

      return <>
        <span>Last updated {lastFetchedMessage}</span>
        {enabled
          ? <span>Next {updateInterval} update will be {nextUpdateMessage}</span>
          : <span>Enable this playlist to resume auto-updates</span>
        }
      </>
    } else if (enabled) {
      return <span>This playlist's first auto-update should be happening soon!</span>
    } else {
      return <span>Enable this playlist to resume auto-updates</span>
    }
  }

  render() {
    const { playlist } = this.props
    return (
      // @ts-ignore
      <PlaylistItemContainer enabled={playlist.enabled}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{playlist.name}</h3>
            <Switch
              checked={playlist.enabled}
              loading={this.state.statusChangeLoading}
              onChange={(enabled) => this.toggleEnabled(playlist.id!, enabled)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
            {this.renderNextRun(playlist)}

            <h4 style={{ marginTop: 12 }}>Subreddits</h4>
            <div>
              {playlist.subreddits.map(sub =>
                <Tag key={sub} style={{ marginBottom: 8 }}>{sub}</Tag>
              )}
            </div>
          </div>
        </div>
      </PlaylistItemContainer>
    )
  }
}

const PlaylistItemContainer = styled.div`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ enabled }: any) => enabled ? '#1DA57A' : 'gray'};
  border-radius: 6px;
  background-color: #030607;
  cursor: ${({ enabled }: any) => enabled ? 'pointer' : ''};
  transition: all 200ms;
  
  &:hover {
    ${({ enabled }: any) => enabled ? 'transform: scale(1.0125)' : ''};
  }
  
  .ant-tag {
    cursor: default;
    ${({ enabled }: any) => !enabled && 'background-color: gray' }
    
    &:hover {
      opacity: 1;
    }
  }
`

