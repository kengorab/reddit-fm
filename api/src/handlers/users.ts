import { APIGatewayProxyHandler } from 'aws-lambda'
import * as _ from 'lodash'
import * as UUID from 'uuid'
import * as UserApi from '../users/user-dao'
import * as RedditApi from '../reddit/reddit-api'
import { withCors } from '../utils/cors'

export const user = {
  'id': 'cd1e657d-570e-4c8c-b015-4e82b064a6b7',
  'spotifyDisplayName': 'Ken',
  'spotifyId': '0ra94mq97ohw7pe055iwwlvl7',
  'spotifyRefreshToken': 'AQBFbU5B6vit3UM0TklFJMbxzhDI26_2Z142XGi-UAvUXG4JTFqwZdGwfOce6m0bEsQxlEAYyUqnJuPL6FcegGfsxKD6qwx75bb8j7kRnNZFlQulyYwuGeaNpm86BygSEqCcgw',
  'playlistConfigs': [{
    'subreddits': ['/r/BlackMetal'],
    'updateInterval': 'weekly',
    'created': 1548629447479,
    'lastFetched': 1548629448879,
    'maxToAdd': 20,
    'name': 'a',
    'isPublic': false,
    'id': 'd1e657d-570e-4c8c-b015-4e82b064a6b7c',
    'shuffle': true,
    'enabled': false
  }, {
    'subreddits': ['/r/BlackMetal', '/r/deathcore', '/r/deathmetal', '/r/melodicdeathmetal'],
    'updateInterval': 'daily',
    'created': 1548629784186,
    'lastFetched': 1549052737000,
    'maxToAdd': 20,
    'name': 'B',
    'isPublic': false,
    'id': '1e657d-570e-4c8c-b015-4e82b064a6b7cd',
    'shuffle': true,
    'enabled': true
  }, {
    'subreddits': ['/r/LofiHipHop'],
    'updateInterval': 'weekly',
    'created': 1548630038642,
    'lastFetched': 1549052737000,
    'maxToAdd': 20,
    'name': 'C',
    'isPublic': false,
    'id': 'e657d-570e-4c8c-b015-4e82b064a6b7cd1',
    'shuffle': true,
    'enabled': true
  }, {
    'subreddits': ['/r/classicalmusic'],
    'updateInterval': 'weekly',
    'created': 1548630114647,
    'lastFetched': null,
    'maxToAdd': 20,
    'name': 'D',
    'isPublic': false,
    'id': '657d-570e-4c8c-b015-4e82b064a6b7cd1e',
    'shuffle': true,
    'enabled': false
  }, {
    'subreddits': ['/r/underoath'],
    'updateInterval': 'weekly',
    'created': 1548632401144,
    'lastFetched': null,
    'maxToAdd': 20,
    'name': 'C',
    'isPublic': false,
    'id': '57d-570e-4c8c-b015-4e82b064a6b7cd1e6',
    'shuffle': true,
    'enabled': true
  }]
}

// GET /users/:userId
export const getUser: APIGatewayProxyHandler = withCors(async event => {
  const { userId } = event.pathParameters
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required path param: uuid' })
    }
  }

  //const user = await UserApi.getUserById(userId)
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No user present with id ${userId}` })
    }
  }

  // Omit fields which expose any Spotify user information
  const secureUser = _.omit(user, 'spotifyRefreshToken', 'spotifyId')
  return {
    statusCode: 200,
    body: JSON.stringify(secureUser)
  }
})

// POST /users/:userId/playlists
export const createPlaylist: APIGatewayProxyHandler = withCors(async event => {
  const { userId } = event.pathParameters
  if (!userId) {
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

  const user = await UserApi.getUserById(userId)
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No user present with id ${userId}` })
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

  //const user = await UserApi.getUserById(userId)
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
  //await UserApi.updateUser(user)
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
