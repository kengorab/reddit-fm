import * as React from 'react'
import { Icon, Layout, Menu } from 'antd'
import * as auth from '../data/auth'
import { History } from 'history'

interface Props {
  user: User | null,
  history: History
}

export default function Header({ user, history }: Props) {
  const dropdown = !user
    ? null
    : (
      <Menu theme="dark" mode="horizontal" style={{ lineHeight: '64px' }}>
        <Menu.SubMenu
          title={(
            <>
              <Icon type="user"/>
              <span style={{ marginRight: 6 }}>
              Hi, {user!.spotifyDisplayName}
            </span>
              <Icon style={{ fontSize: 12 }} type="caret-down"/>
            </>
          )}
        >
          <Menu.Item key="logout" onClick={() => {
            auth.logOut()
            history.replace('/')
          }}>
            <Icon type="logout"/>
            Log out
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    )

  return (
    <Layout.Header className="hflex-space-betw">
      <h2 style={{ margin: 0 }}>Reddit FM</h2>
      {dropdown}
    </Layout.Header>
  )
}
