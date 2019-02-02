import { APIGatewayProxyHandler } from 'aws-lambda'
import * as _ from 'lodash'
import * as UUID from 'uuid'
import * as UserApi from '../users/user-dao'
import * as RedditApi from '../reddit/reddit-api'
import { withCors } from '../utils/cors'

// GET /users/:uuid
export const getUser: APIGatewayProxyHandler = withCors(async event => {
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
})

// POST /users/:uuid/playlists
export const createPlaylist: APIGatewayProxyHandler = withCors(async event => {
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
    id: UUID.v4(),
    enabled: true,
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
})

async function handleEnableOrDisable(
  targetStatus: boolean,
  userId: string,
  playlistId: string
) {
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required path param: userId' })
    }
  } else if (!playlistId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required path param: playlistId' })
    }
  }

  const user = await UserApi.getUserById(userId)
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No user present with uuid ${userId}` })
    }
  }

  const playlistIdx = user.playlistConfigs.findIndex(({ id }) => id === playlistId)
  if (playlistIdx === -1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No playlist found with id ${playlistId}` })
    }
  }

  if (user.playlistConfigs[playlistIdx].enabled === targetStatus) {
    return {
      statusCode: 201,
      body: JSON.stringify(user.playlistConfigs[playlistIdx])
    }
  }

  user.playlistConfigs[playlistIdx].enabled = targetStatus
  await UserApi.updateUser(user)
  return {
    statusCode: 200,
    body: JSON.stringify(user.playlistConfigs[playlistIdx])
  }
}

// POST /users/:userId/playlists/:playlistId/status
export const enablePlaylist: APIGatewayProxyHandler = withCors(async event => {
  const { userId, playlistId } = event.pathParameters
  return handleEnableOrDisable(true, userId, playlistId)
})

// DELETE /users/:userId/playlists/:playlistId/status
export const disablePlaylist: APIGatewayProxyHandler = withCors(async event => {
  const { userId, playlistId } = event.pathParameters
  return handleEnableOrDisable(false, userId, playlistId)
})
