import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import * as auth from '../data/auth'

type Props = RouteComponentProps<{ uuid: string }>

export default function LoginScreen(props: Props) {
  const { uuid } = props.match.params
  auth.setUserId(uuid)
  return <Redirect to="/"/>
}
