import { flatten, shuffle, take } from 'lodash'
import { SpotifyApi } from './spotify/spotify-api'
import { getYoutubeVideos } from './reddit/reddit-manager'
import * as RedditApi from './reddit/reddit-api'

interface Result {
  created: string[],
  totalAdded: number,
}

export class Pipeline {
  private readonly spotifyApi: SpotifyApi
  private readonly userPlaylistsPromise: Promise<PlaylistsResponse>

  constructor(private user: User) {
    this.spotifyApi = new SpotifyApi(user.spotifyRefreshToken)
    this.userPlaylistsPromise = this.spotifyApi.getPlaylists()
  }

  private getSongsForSubreddit = async (subreddit: string) => {
    const posts = await RedditApi.getSubredditPosts(subreddit)
    const videos = getYoutubeVideos(posts)

    const songPromises = videos.map(async video => {
      let res = await this.spotifyApi.search(cleanTitle(video.videoTitle))

      if (!res || !res.tracks || res.tracks.total === 0) {
        res = await this.spotifyApi.search(cleanTitle(video.title))

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

  private addToSpotifyPlaylist = async ({ config, songs }) => {
    const playlists = await this.userPlaylistsPromise
    let playlist = playlists.items.find(playlist => playlist.name === config.name)
    let createdPlaylist = false
    if (!playlist) {
      playlist = await this.spotifyApi.createPlaylist(
        config.name,
        getPlaylistDescription(config),
        config.isPublic || false
      )
      createdPlaylist = true
    }
    const playlistTracks = await this.spotifyApi.getPlaylistTracks(playlist)
    const existingUris = playlistTracks.map(track => track.uri)

    const uris = songs
      .map(song => song.song.uri)
      .filter(uri => !existingUris.includes(uri))
    await this.spotifyApi.addSongsToPlaylist(playlist, uris)
    return {
      config,
      createdPlaylist,
      numAdded: uris.length
    }
  }

  public async run(): Promise<Result> {
    const playlistsPromises = this.user.playlistConfigs
      .filter(shouldProcessPlaylistConfig)
      .map(async config => {
        const songsPromises = config.subreddits.map(this.getSongsForSubreddit)
        const songs = await Promise.all(songsPromises)
        const allSongs = flatten(songs).filter(({ song }) => !!song)

        const n = config.maxToAdd || allSongs.length
        const maxAllowableSongs = take(allSongs, n)

        return {
          config,
          songs: config.shuffle ? shuffle(maxAllowableSongs) : maxAllowableSongs
        }
      })
      .map(promise => promise.then(this.addToSpotifyPlaylist)
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

  public static createAndRun(user: User): Promise<Result | null> {
    const pipeline = new Pipeline(user)
    try {
      return pipeline.run()
    } catch (e) {
      console.error(e)
      return null
    }
  }
}

const cleanTitleRe = /\((?:Official|Audio).*\).*$/i
const cleanTitle = (title: string) => title.replace(cleanTitleRe, '').trim()

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

