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
import { Provider, Consumer, UserContext } from './contexts/UserContext'

type Props = UserContext
type State = { loading: boolean }

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { loading: true }
  }

  async componentDidMount() {
    const user = await UserService.getUser()
    this.props.setUser(user!)
    this.setState({ loading: false })
  }

  private renderContent = () =>
    this.state.loading
      ? (
        <div className="flex-center">
          <Spin indicator={<Icon type="loading" style={{ fontSize: 48 }} spin/>}/>
        </div>
      )
      : (
        <Switch>
          <Route exact path="/" component={HomeScreen}/>
          <Route exact path="/playlists/new" component={CreatePlaylistScreen}/>
        </Switch>
      )

  private renderIndexRoute = (props: RouteComponentProps) =>
    !auth.isLoggedIn()
      ? <WelcomeScreen {...props} />
      : (
        <Layout>
          <Header history={props.history}/>
          <Layout.Content style={{ paddingTop: 64 }}>
            <main>
              {this.renderContent()}
            </main>
          </Layout.Content>
        </Layout>
      )

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

export default function

  Router() {
  return (
    <Provider user={null}>
      <Consumer>
        {({ user, setUser }: UserContext) =>
          <App user={user} setUser={setUser}/>
        }
      </Consumer>
    </Provider>
  )
}
