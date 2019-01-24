import React from 'react'
import { BrowserRouter, Route, RouteComponentProps, Switch } from 'react-router-dom'
import * as auth from './storage/auth'
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'

export default class App extends React.Component {
  private renderIndexRoute = (props: RouteComponentProps) => {
    if (!auth.isLoggedIn()) {
      return <WelcomeScreen/>
    } else {
      return <HomeScreen {...props}/>
    }
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" render={this.renderIndexRoute}/>
          <Route exact path="/login/:uuid" component={LoginScreen}/>
        </Switch>
      </BrowserRouter>
    )
  }
}
