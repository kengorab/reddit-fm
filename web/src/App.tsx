import React from 'react'
import { Icon, Layout, Spin } from 'antd'
import { BrowserRouter, Route, RouteComponentProps, Switch } from 'react-router-dom'
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import CreatePlaylistScreen from './screens/CreatePlaylistScreen'
import Header from './components/Header'
import * as auth from './data/auth'
import * as UserService from './data/user-service'

type State = { user: User | null, loading: boolean }

export default class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props)
    this.state = { user: null, loading: true }
  }

  async componentDidMount() {
    const user = await UserService.getUser()
    this.setState({ user, loading: false })
  }

  private renderContent = () => {
    if (this.state.loading) {
      return (
        <div className="flex-center">
          <Spin indicator={<Icon type="loading" style={{ fontSize: 48 }} spin/>}/>
        </div>
      )
    }

    return (
      <Switch>
        <Route exact path="/" render={() => <HomeScreen user={this.state.user!}/>}/>
        <Route exact path="/playlists/new" component={CreatePlaylistScreen}/>
      </Switch>
    )
  }

  private renderIndexRoute = (props: RouteComponentProps) => {
    if (!auth.isLoggedIn()) {
      return <WelcomeScreen {...props} />
    }

    return (
      <Layout>
        <Header user={this.state.user} history={props.history}/>
        <Layout.Content>
          <main>
            {this.renderContent()}
          </main>
        </Layout.Content>
      </Layout>
    )
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/login/:uuid" component={LoginScreen}/>
          <Route path="/" render={this.renderIndexRoute}/>
        </Switch>
      </BrowserRouter>
    )
  }
}
