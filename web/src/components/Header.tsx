import * as React from 'react'
import styled from 'styled-components'
import { Icon, Layout, Menu } from 'antd'
import { History } from 'history'
import * as auth from '../data/auth'
import { Context } from '../contexts/UserContext'

interface Props {
  history: History
}

export default function Header({ history }: Props) {
  const { user } = React.useContext(Context)

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
    <LayoutHeader>
      <h2 style={{ margin: 0 }}>Reddit FM</h2>
      {dropdown}
    </LayoutHeader>
  )
}

const LayoutHeader = styled(Layout.Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  z-index: 2;
  
  .ant-menu-submenu-title {
    padding: 0;
  }
  
  @media screen and (max-width: 800px) {
    padding: 0 24px !important;
  }
`