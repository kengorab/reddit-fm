import * as React from 'react'
import { RouteComponentProps } from 'react-router'

type Props = RouteComponentProps
type State = { user: User | null, loading: boolean }

export default class CreatePlaylistScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { user: null, loading: true }
  }

  public render() {
    return (
      <div>
        <h1>Create Playlist</h1>
      </div>
    )
  }
}
