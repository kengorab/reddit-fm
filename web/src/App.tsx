import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { WelcomeScreen } from './screens/WelcomeScreen'

export default class App extends React.Component {
  private renderIndexRoute = () => {
    const loggedIn = localStorage.getItem('loggedIn')
    if (!loggedIn) {
      return <WelcomeScreen/>
    } else {
      return <h1>{loggedIn}</h1>
    }
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" render={this.renderIndexRoute}/>
        </Switch>
      </BrowserRouter>
    )
  }
}
