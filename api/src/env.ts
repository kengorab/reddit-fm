require('dotenv').config()

// Provided by .env
export const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
export const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET
export const spotifyStateValue = process.env.SPOTIFY_STATE_VALUE
export const redirectUrlBase = process.env.REDIRECT_URL_BASE
export const frontendUrlBase = process.env.FRONTEND_BASE

// Provided by serverless.yml
export const tableName = process.env.DYNAMODB_TABLE
