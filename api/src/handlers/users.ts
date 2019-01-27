import { APIGatewayProxyHandler } from 'aws-lambda'
import * as UserApi from '../users/user-dao'
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
