import { flatten, shuffle, take } from 'lodash'
import { SpotifyApi } from '../spotify/spotify-api'
import { getYoutubeVideos } from '../reddit/reddit-manager'
import * as RedditApi from '../reddit/reddit-api'
import * as UserApi from '../users/user-dao'

interface SingleResult {
  config: PlaylistConfig,
  created: string[],
  totalAdded: number,
}

interface Result {
  created: string[],
  totalAdded: number,
}

interface Song {
  id: string,
  uri: string,
  name: string,
  album: string,
  artist: string,
  albumArt: string,
  url: string
}

export class Pipeline {
  private readonly spotifyApi: SpotifyApi
  private readonly initializePromise: Promise<void>

  constructor(private user: User) {
    this.spotifyApi = new SpotifyApi(user.spotifyAccessToken, user.spotifyRefreshToken)
    this.initializePromise = this.spotifyApi.initialize()
      .then(async ({ accessToken, changed }) => {
        if (changed) {
          await UserApi.updateUser({ ...user, spotifyAccessToken: accessToken })
        }
      })
  }

  private getSongsForSubreddit = async (subreddit: string): Promise<Song[]> => {
    const posts = await RedditApi.getSubredditPosts(subreddit)
    const videos = getYoutubeVideos(posts)

    const songPromises = videos.map(async video => {
      await this.initializePromise
      let res = await this.spotifyApi.search(cleanTitle(video.videoTitle))

      if (!res || !res.tracks || res.tracks.total === 0) {
        res = await this.spotifyApi.search(cleanTitle(video.title))

        if (!res || !res.tracks || res.tracks.total === 0) {
          return null
        }
      }

      const track = res.tracks.items[0]
      return {
        id: track.id,
        uri: track.uri,
        name: track.name,
        album: track.album.name,
        artist: track.artists[0].name,
        albumArt: track.album.images.sort((a, b) => b.height - a.height)[0].url,
        url: track.external_urls.spotify
      }
    })

    const songs = await Promise.all(songPromises)
    return songs.filter(song => !!song)
  }

  private addToSpotifyPlaylist = async (config: PlaylistConfig, songs: Song[]) => {
    let createdPlaylistId = null
    let playlist: Playlist
    if (config.spotifyId) {
      try {
        playlist = await this.spotifyApi.getPlaylist(config.spotifyId)
      } catch (e) {
        console.log('Error getting playlist:', e)
      }
    }
    if (!playlist) {
      playlist = await this.spotifyApi.createPlaylist(
        config.name,
        getPlaylistDescription(config),
        config.isPublic || false
      )
      createdPlaylistId = playlist.id
    }
    const playlistTracks = await this.spotifyApi.getPlaylistTracks(playlist)
    const existingUris = playlistTracks.map(track => track.uri)

    const uris = songs
      .map(song => song.uri)
      .filter(uri => !existingUris.includes(uri))
    if (uris.length !== 0) {
      await this.spotifyApi.addSongsToPlaylist(playlist, uris)
    }

    return {
      config,
      createdPlaylistId,
      numAdded: uris.length
    }
  }

  public async getSongsForPlaylist(
    subreddits: string[],
    maxToAdd: number,
    shuffleSongs: boolean = true
  ): Promise<Song[]> {
    const songsPromises = subreddits.map(this.getSongsForSubreddit)
    const songs = await Promise.all(songsPromises)
    const allSongs = flatten(songs)

    const n = maxToAdd || allSongs.length
    const maxAllowableSongs = take(allSongs, n)

    return shuffleSongs ? shuffle(maxAllowableSongs) : maxAllowableSongs
  }

  public async runForPlaylist(playlist: PlaylistConfig): Promise<SingleResult> {
    const songs = await this.getSongsForPlaylist(
      playlist.subreddits,
      playlist.maxToAdd,
      playlist.shuffle
    )
    const result = await this.addToSpotifyPlaylist(playlist, songs)

    const now = Date.now()
    this.user.playlistConfigs.find(({ id }) => id === playlist.id)
      .lastFetched = now
    playlist.lastFetched = now
    if (result.createdPlaylistId) {
      playlist.spotifyId = result.createdPlaylistId
    }
    await UserApi.updateUser(this.user)

    return {
      config: playlist,
      created: result.createdPlaylistId ? [playlist.name] : [],
      totalAdded: result.numAdded
    }
  }

  public async run(): Promise<Result> {
    const playlistsPromises = this.user.playlistConfigs
      .filter(shouldProcessPlaylistConfig)
      .map(this.runForPlaylist)

    const results = await Promise.all(playlistsPromises)
    return results.reduce(
      (acc, { created, totalAdded }) => ({
        created: acc.created.concat(created),
        totalAdded: acc.totalAdded + totalAdded
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

