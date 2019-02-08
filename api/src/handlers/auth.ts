import { APIGatewayProxyHandler } from 'aws-lambda'
import * as env from '../env'
import { SpotifyApi } from '../spotify/spotify-api'
import * as UserApi from '../users/user-dao'

const redirectUrl = `${env.redirectUrlBase}/spotify/verify`

// GET /spotify/login
export const spotifyLogin: APIGatewayProxyHandler = async () => {
  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ')

  const url = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${env.spotifyClientId}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
    `&state=${env.spotifyStateValue}`

  return {
    statusCode: 301,
    headers: {
      Location: url
    },
    body: ''
  }
}

const redirectToFrontendWithError = () => ({
  statusCode: 301,
  headers: {
    Location: `${env.frontendUrlBase}?e`
  },
  body: ''
})

// GET /spotify/verify
export const spotifyVerify: APIGatewayProxyHandler = async event => {
  const { code, state, error } = event.queryStringParameters

  // As per the Spotify contract, the `state` param should contain the value
  // passed to the /authorize endpoint. If it doesn't, there was some MITM attack
  if (state !== env.spotifyStateValue) {
    console.error(`State param mismatch, received ${state}`)
    return redirectToFrontendWithError()
  }

  // If the `error` param has a value, there was some problem that happened
  if (error) {
    console.error(`Received error from spotify verification: ${error}`)
    return redirectToFrontendWithError()
  }

  try {
    // Exchange the `code` for access and refresh tokens
    const body = Object.entries({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUrl,
      client_id: env.spotifyClientId,
      client_secret: env.spotifyClientSecret
    })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body
    })
    const json = await res.json()
    if (res.status !== 200) {
      console.error(`Error when getting access and refresh tokens: ${json}`)
      return redirectToFrontendWithError()
    }

    const { access_token: accessToken, refresh_token: refreshToken } = json
    const spotify = new SpotifyApi(accessToken, refreshToken)
    const spotifyUser = await spotify.getMe()

    // If this Spotify user has already created an account with us, don't create another
    let uuid
    const storedUser = await UserApi.getUserBySpotifyId(spotifyUser.id)
    if (storedUser) {
      uuid = storedUser.id
    } else {
      const newUser = await UserApi.saveUser(
        refreshToken,
        accessToken,
        spotifyUser.id,
        spotifyUser.display_name
      )
      uuid = newUser.id
    }

    // Redirect to frontend with user's uuid
    return {
      statusCode: 301,
      headers: {
        Location: `${env.frontendUrlBase}/login/${uuid}`
      },
      body: ''
    }
  } catch (e) {
    console.error(`Error during retrieval of token: ${e}`)
    return redirectToFrontendWithError()
  }
}
