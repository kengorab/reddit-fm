import * as React from 'react'
import { Form } from 'antd'
import { RouteComponentProps } from 'react-router'
import { PlaylistForm } from '../components/PlaylistForm'
import * as UserService from '../data/user-service'

const CreatePlaylistForm = Form.create({})(PlaylistForm)

interface Props extends RouteComponentProps {
  onUpdateUser: (user: User) => void
}

export default function CreatePlaylistScreen(props: Props) {
  return (
    <div>
      <h1>Create New Playlist</h1>
      <CreatePlaylistForm
        onPreview={async () => {
          await new Promise(res => setTimeout(res, 1000))
        }}
        onSubmit={async (v) => {
          await new Promise(res => setTimeout(res, 1000))
          const res = await UserService.createPlaylist(v)
          if (res.success) {
            props.onUpdateUser(res.user!)
            props.history.push('/')
          }
          return res
        }}
      />
    </div>
  )
}
