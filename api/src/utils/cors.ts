import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda'

export function cors(res: APIGatewayProxyResult): APIGatewayProxyResult {
  return {
    ...res,
    headers: {
      ...res.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD',
      'Access-Control-Allow-Credentials': true
    }
  }
}

export function withCors(handler: APIGatewayProxyHandler): APIGatewayProxyHandler {
  return (
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
  ) => {
    const res = handler(event, context, callback)
    if (!res) return res
    return res.then(cors)
  }
}
