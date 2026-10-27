import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

export interface SearchAlbum {
  id: string;
  title: string;
  artist: string;
  image: string;
  releaseDate: string;
}

export interface SearchArtist {
  id: string;
  name: string;
  image: string;
}

export interface SearchResults {
  tracks: Track[];
  albums: SearchAlbum[];
  artists: SearchArtist[];
}

// Defines the Spotify album data used by Search
interface SpotifyAlbum {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  images: {
    url: string;
  }[];
  release_date: string;
}

// Defines the Spotify artist data used by Search
interface SpotifyArtist {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
}

// Searches Spotify for tracks, albums and artists
export async function searchSpotify(query: string): Promise<SearchResults> {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return {
      tracks: [],
      albums: [],
      artists: [],
    };
  }

  const data = await spotifyFetch(
    `/search?q=${encodeURIComponent(cleanQuery)}&type=track,album,artist&limit=10`,
  );

  // Converts Spotify tracks into the Track structure used by Purrify
  const spotifyTracks: SpotifyTrack[] = data.tracks?.items ?? [];

  const tracks: Track[] = spotifyTracks
    .filter((track) => track.id && track.uri && track.name)
    .map((track) => mapSpotifyTrack(track));

  // Converts Spotify albums into the album structure used by Search
  const spotifyAlbums: SpotifyAlbum[] = data.albums?.items ?? [];

  const albums: SearchAlbum[] = spotifyAlbums
    .filter((album) => album.id)
    .map((album) => ({
      id: album.id,
      title: album.name,
      artist: album.artists.map((artist) => artist.name).join(", "),
      image: album.images[0]?.url ?? "",
      releaseDate: album.release_date,
    }));

  // Converts Spotify artists into the artist structure used by Search
  const spotifyArtists: SpotifyArtist[] = data.artists?.items ?? [];

  const artists: SearchArtist[] = spotifyArtists
    .filter((artist) => artist.id)
    .map((artist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url ?? "",
    }));

  return {
    tracks,
    albums,
    artists,
  };
}
