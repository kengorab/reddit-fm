import * as React from 'react'
import { Alert, Button, Layout } from 'antd'
import { RouteComponentProps } from 'react-router'

type Props = RouteComponentProps

export default function WelcomeScreen(props: Props) {
  const query = new URLSearchParams(props.location.search)
  const isError = query.has('e')

  return (
    <Layout>
      <Layout.Header>
        <h2 style={{ margin: 0 }}>Reddit FM</h2>
      </Layout.Header>
      <Layout.Content>
        <main>
          <h1>Fresh music, à la Reddit</h1>
          <p>
            Reddit FM is a service where you can create auto-updating playlists on Spotify,
            curated by your favorite subreddits
          </p>

          <p>It goes like this:</p>
          <ol>
            <li>Pick a name for your playlist</li>
            <li>Select some subreddits which post music that you like</li>
            <li>Select how often you'd like your playlist to be updated</li>
            <li>Enjoy some music!</li>
          </ol>
          <p>Sound interesting? Let's get started!</p>

          <br/>

          <h2>Sign in to Spotify</h2>
          <p>
            We won't share or store any of your personal information,
            and we won't do anything other than create and update some
            playlists. And you can turn this off at any time.
          </p>
          {isError && (
            <Alert
              style={{ marginBottom: 12 }}
              message="Something went wrong..."
              description="There was an issue signing you into Spotify. Please try again in a little bit"
              type="error"
              showIcon
            />
          )}
          <Button type="primary" href="https://25c11774.ngrok.io/spotify/login">
            <i className="fab fa-spotify"/> &nbsp;
            Sign in to Spotify
          </Button>
        </main>
      </Layout.Content>
    </Layout>
  )
}
