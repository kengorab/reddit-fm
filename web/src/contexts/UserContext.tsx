import * as React from 'react'

export interface UserContext {
  user: User | null
  setUser: (user: User) => void
}

// @ts-ignore
export const Context = React.createContext<UserContext>()
export const { Consumer } = Context

interface Props {
  user: User | null
  children: JSX.Element[] | JSX.Element
}

interface State {
  user: User | null
}

export class Provider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { user: props.user }
  }

  setUser = (user: User) => this.setState({ user })

  render() {
    return (
      <Context.Provider value={{ user: this.state.user, setUser: this.setUser }}>
        {this.props.children}
      </Context.Provider>
    )
  }
}
