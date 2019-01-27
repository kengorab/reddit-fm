import * as UUID from 'uuid'
import * as AWS from 'aws-sdk'
import * as env from '../env'

const db = new AWS.DynamoDB.DocumentClient()
const TableName = env.tableName

export async function getUsers(): Promise<(User | null)[]> {
  const res = await db.scan({ TableName }).promise()
  return res.Items as User[]
}

export async function saveUser(
  spotifyRefreshToken: string,
  spotifyId: string,
  spotifyDisplayName: string
): Promise<User> {
  const id = UUID.v4()

  const user = {
    id,
    spotifyRefreshToken,
    spotifyId,
    spotifyDisplayName,
    playlistConfigs: []
  }

  await db.put({ TableName, Item: user }).promise()
  return user
}

export async function getUserBySpotifyId(userSpotifyId: string): Promise<User | null> {
  const result = await db.scan({
    TableName,
    FilterExpression: 'spotifyId = :sid',
    ExpressionAttributeValues: {
      ':sid': userSpotifyId
    }
  }).promise()
  if (result.Count === 0) {
    return null
  }
  return result.Items[0] as User
}

export async function getUserById(id: string): Promise<User | null> {
  return {
    id: id,
    spotifyDisplayName: 'Ken',
    spotifyId: 'zklxjcvnlk',
    spotifyRefreshToken: 'zixuchvokjlwer',
    playlistConfigs: []
  }
}
