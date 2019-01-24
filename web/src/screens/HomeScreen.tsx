import * as React from 'react'
import { Button, Layout } from 'antd'
import { RouteComponentProps } from 'react-router'
import * as auth from '../storage/auth'

type Props = RouteComponentProps

export default function HomeScreen(props: Props) {
  return (
    <Layout>
      <Layout.Header className="hflex-space-betw">
        <h2 style={{ margin: 0 }}>Reddit FM</h2>
        <Button ghost onClick={() => {
          auth.logOut()
          props.history.replace('/')
        }}>
          Log out
        </Button>
      </Layout.Header>
      <Layout.Content>
        <main>
          <h1>Logged in!</h1>
        </main>
      </Layout.Content>
    </Layout>
  )
}
