import * as React from 'react'
import { Form, Icon, Spin } from 'antd'
import { RouteComponentProps } from 'react-router'
import { PlaylistForm } from '../components/PlaylistForm'
import * as UserService from '../data/user-service'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { SongList } from '../components/SongList'
import { UserContext, Consumer, Context } from '../contexts/UserContext'

const CreatePlaylistForm = Form.create({})(PlaylistForm)

interface Props extends RouteComponentProps {
  onUpdateUser: (user: User) => void
}

interface State {
  showPreview: boolean,
  previewLoading: boolean,
  songs: Song[]
}

class CreatePlaylistScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { showPreview: false, previewLoading: false, songs: [] }
  }

  onPreview = async (subreddits: string[] = [], maxToAdd: number) => {
    this.setState({ showPreview: true, previewLoading: true })
    const { songs } = await UserService.getPlaylistSongs(subreddits, maxToAdd)
    this.setState({ previewLoading: false, songs })
  }

  onSubmit = async (value: PlaylistConfig) => {
    const res = await UserService.createPlaylist(value)
    if (res.success) {
      this.props.onUpdateUser(res.user!)
      this.props.history.push('/')
    }
    return res
  }

  renderPreview = () => {
    return <>
      <h2>Playlist Preview</h2>
      <p>
        This is a preview of what your playlist could look like, based on the
        subreddits you've selected
      </p>
      {this.state.previewLoading && (
        <div className="flex-center">
          <Spin indicator={<Icon type="loading" style={{ fontSize: 48 }} spin/>}/>
        </div>
      )}
      {!this.state.previewLoading && !this.state.songs && (
        <span>There was an error loading the preview...</span>
      )}

      {!this.state.previewLoading && this.state.songs && (
        <SongList songs={this.state.songs}/>
      )}
    </>
  }

  render() {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Create New Playlist', href: '/playlists/new' }]}/>

        <h1>Create New Playlist</h1>
        <CreatePlaylistForm onPreview={this.onPreview} onSubmit={this.onSubmit}/>
        {this.state.showPreview && this.renderPreview()}
      </div>
    )
  }
}

export default function (props: RouteComponentProps) {
  return (
    <Consumer>
      {({ setUser }: UserContext) =>
        <CreatePlaylistScreen onUpdateUser={setUser} {...props}/>
      }
    </Consumer>
  )
}