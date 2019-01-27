import { APIGatewayProxyHandler } from 'aws-lambda'
import * as UserApi from '../users/user-dao'
import * as RedditApi from '../reddit/reddit-api'
import * as _ from 'lodash'

// GET /users/:uuid
export const getUser: APIGatewayProxyHandler = async event => {
  const { uuid } = event.pathParameters
  if (!uuid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required path param: uuid' })
    }
  }

  const user = await UserApi.getUserById(uuid)
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No user present with uuid ${uuid}` })
    }
  }

  // Omit fields which expose any Spotify user information
  const secureUser = _.omit(user, 'spotifyRefreshToken', 'spotifyId')
  return {
    statusCode: 200,
    body: JSON.stringify(secureUser)
  }
}

// POST /users/:uuid/playlists
export const createPlaylist: APIGatewayProxyHandler = async event => {
  const { uuid } = event.pathParameters
  if (!uuid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required path param: uuid' })
    }
  }

  const body = JSON.parse(event.body) as PlaylistConfig
  const playlistConfig: PlaylistConfig = {
    ...body,
    created: Date.now(),
    lastFetched: null,
    shuffle: true,
    isPublic: false
  }

  const subredditsExist = await Promise.all(
    playlistConfig.subreddits.map(RedditApi.subredditExists)
  )
  const nonExistentSubreddits = subredditsExist
    .map((exists, idx) => !exists ? playlistConfig.subreddits[idx] : null)
    .filter(item => !!item)
  if (nonExistentSubreddits.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        invalidSubreddits: nonExistentSubreddits
      })
    }
  }

  const user = await UserApi.getUserById(uuid)
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No user present with uuid ${uuid}` })
    }
  }

  user.playlistConfigs.push(playlistConfig)

  const updatedUser = await UserApi.updateUser(user)
  const secureUpdatedUser = _.omit(updatedUser, 'spotifyRefreshToken', 'spotifyId')

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      user: secureUpdatedUser
    })
  }
}
