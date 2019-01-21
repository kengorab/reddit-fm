import { APIGatewayProxyHandler } from 'aws-lambda'
import { flatten, shuffle, take } from 'lodash'
import * as UserApi from './users/user-dao'
import * as RedditApi from './reddit/reddit-api'
import * as SpotifyApi from './spotify/spotify-api'

const acceptableMediaTypes = ['youtube.com']

export function getYoutubeVideos(posts: RedditPost[]) {
  return posts
    .filter(post => post.secure_media || post.media)
    .filter(post => {
      const media = post.secure_media || post.media
      return acceptableMediaTypes.includes(media.type)
    })
    .map(post => {
        const media = post.secure_media || post.media
        return {
          title: post.title,
          url: post.url,
          videoTitle: media.oembed.title
        }
      }
    )
}

const cleanTitleRe = /\((?:Official|Audio).*\).*$/i
const cleanTitle = (title: string) => title.replace(cleanTitleRe, '').trim()

async function getSongsForSubreddit(user: User, subreddit: string) {
  const posts = await RedditApi.getSubredditPosts(subreddit)
  const videos = getYoutubeVideos(posts)

  const songPromises = videos.map(async video => {
    let res = await SpotifyApi.search(user.spotifyToken, cleanTitle(video.videoTitle))

    if (!res || !res.tracks || res.tracks.total === 0) {
      res = await SpotifyApi.search(user.spotifyToken, cleanTitle(video.title))

      if (!res || !res.tracks || res.tracks.total === 0) {
        return ({ ...video, song: null })
      }
    }

    const track = res.tracks.items[0]
    const song = {
      id: track.id,
      uri: track.uri,
      name: track.name,
      album: track.album.name,
      artist: track.artists[0].name
    }

    return ({ ...video, song })
  })

  return Promise.all(songPromises)
}

function shouldProcessPlaylistConfig(config: PlaylistConfig): boolean {
  if (config.lastFetched === null) return true

  const now = Date.now()
  const dayInMs = 1000 * 60 * 60 * 24

  switch (config.updateInterval) {
    case 'daily':
      return now - config.lastFetched >= dayInMs
    case 'weekly':
    default:
      return now - config.lastFetched >= dayInMs * 7
  }
}

function getPlaylistDescription(config: PlaylistConfig) {
  let subreddits = config.subreddits.join(', ')
  return `Automatically updated based on music posted to these subreddits: ${subreddits}; updated ${config.updateInterval}`
}

async function processUser(user: User) {
  const userPlaylistsPromise = SpotifyApi.getPlaylists(user)

  const playlistsPromises = user.playlistConfigs
    .filter(shouldProcessPlaylistConfig)
    .map(async config => {
      const songsPromises = config.subreddits.map(config => getSongsForSubreddit(user, config))
      const songs = await Promise.all(songsPromises)
      const allSongs = flatten(songs).filter(({ song }) => !!song)

      const n = config.maxToAdd || allSongs.length
      const maxAllowableSongs = take(allSongs, n)

      return {
        config,
        songs: config.shuffle ? shuffle(maxAllowableSongs) : maxAllowableSongs
      }
    })
    .map(promise =>
      promise.then(async ({ config, songs }) => {
        const playlists = await userPlaylistsPromise
        let playlist = playlists.items.find(playlist => playlist.name === config.name)
        let createdPlaylist = false
        if (!playlist) {
          playlist = await SpotifyApi.createPlaylist(
            user,
            config.name,
            getPlaylistDescription(config),
            config.isPublic || false
          )
          createdPlaylist = true
        }
        const playlistTracks = await SpotifyApi.getPlaylistTracks(user, playlist)
        const existingUris = playlistTracks.map(track => track.uri)

        const uris = songs
          .map(song => song.song.uri)
          .filter(uri => !existingUris.includes(uri))
        await SpotifyApi.addSongsToPlaylist(user, playlist, uris)
        return {
          config,
          createdPlaylist,
          numAdded: uris.length
        }
      })
    )
  const results = await Promise.all(playlistsPromises)
  return results.reduce(
    (acc, { config, createdPlaylist, numAdded }) => ({
      created: createdPlaylist ? acc.created.concat(config.name) : acc.created,
      totalAdded: acc.totalAdded + numAdded
    }),
    {
      created: [],
      totalAdded: 0
    }
  )
}

export const hello: APIGatewayProxyHandler = async (event, context) => {
  const users = await UserApi.getUsers()
  const result = await Promise.all(users.map(processUser))

  return {
    statusCode: 200,
    body: JSON.stringify({
      result
    })
  }
}
