import { spotifyFetch } from './spotifyClient'

export function getSpotifyProfile() {
  return spotifyFetch('/me')
}