import * as auth from './auth'
import { backendBase } from '../env'

export async function getUser(): Promise<User | null> {
  const id = auth.getUserId()
  const url = `${backendBase}/users/${id}`

  const res = await fetch(url)
  return res.json()
}
