import { APIGatewayProxyHandler } from 'aws-lambda'
import * as UserApi from './users/user-dao'
import { Pipeline } from './pipeline'

export const hello: APIGatewayProxyHandler = async (event, context) => {
  const users = await UserApi.getUsers()
  const result = await Promise.all(users.map(Pipeline.createAndRun))

  return {
    statusCode: 200,
    body: JSON.stringify({
      result
    })
  }
}
