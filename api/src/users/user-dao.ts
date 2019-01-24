const users = [
]

export async function getUsers(): Promise<User[]> {
  return users
}

export async function getUserBySpotifyId(userSpotifyId: string): Promise<User | null> {
  return users.find(user => user.spotifyId === userSpotifyId)
}

export async function getUserById(userId: string): Promise<User | null> {
  return users.find(user => user.id === userId)
}
