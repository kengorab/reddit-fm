import { APIGatewayProxyHandler } from 'aws-lambda'
import { withCors } from '../utils/cors'
import { Pipeline } from '../pipeline'
import * as UserApi from '../users/user-dao'

// GET /users/:userId/playlists/songs?subreddits[]&maxToAdd
export const getSongsForPlaylist: APIGatewayProxyHandler = withCors(async event => {
  try {
    const { userId } = event.pathParameters
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required path param: uuid' })
      }
    }
    const user = await UserApi.getUserById(userId)
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No user present with id ${userId}` })
      }
    }

    if (!event.queryStringParameters) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required query parameter: subreddits' })
      }
    }

    let { subreddits, maxToAdd } = event.queryStringParameters
    if (!subreddits) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required query parameter: subreddits' })
      }
    }
    if (!maxToAdd) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required query parameter: maxToAdd' })
      }
    }

    const pipeline = new Pipeline(user as User)
    const songs = await pipeline.getSongsForPlaylist(
      subreddits.split(','),
      parseInt(maxToAdd, 10)
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ songs })
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.toString() })
    }
  }
})

// POST /users/:userId/playlists/:playlistId/songs/updates
export const runPipelineForPlaylist: APIGatewayProxyHandler = withCors(async event => {
  try {
    const { userId, playlistId } = event.pathParameters
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required path param: uuid' })
      }
    }
    if (!playlistId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required path param: playlistId' })
      }
    }
    const user = await UserApi.getUserById(userId)
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No user present with id ${userId}` })
      }
    }

    const playlist = user.playlistConfigs
      .find(playlistConfig => playlistConfig.id === playlistId)
    if (!playlist) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No playlist present with id ${playlistId} for user ${userId}` })
      }
    }

    const pipeline = new Pipeline(user as User)
    const results = await pipeline.runForPlaylist(playlist)

    return {
      statusCode: 200,
      body: JSON.stringify({ results })
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.toString() })
    }
  }
})
