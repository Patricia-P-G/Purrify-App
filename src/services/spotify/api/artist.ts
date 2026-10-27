import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

// Artist information
export interface ArtistDetails {
  id: string;
  name: string;
  image: string;
  followers: number;
  popularity: number;
  genres: string[];
}

// Artist albums
export interface ArtistAlbum {
  id: string;
  name: string;
  image: string;
  year: string;
  type: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images?: {
    url: string;
  }[];
  followers?: {
    total: number;
  };
  popularity?: number;
  genres?: string[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images?: {
    url: string;
  }[];
  release_date?: string;
  album_type?: string;
}

// Gets artist information for the hero
export async function getArtist(artistId: string): Promise<ArtistDetails> {
  const data: SpotifyArtist = await spotifyFetch(
    `/artists/${encodeURIComponent(artistId)}`
  );

  return {
    id: data.id,
    name: data.name,
    image: data.images?.[0]?.url ?? "",
    followers: data.followers?.total ?? 0,
    popularity: data.popularity ?? 0,
    genres: data.genres ?? [],
  };
}

// Gets artist songs using Spotify Search
export async function getArtistTopTracks(artistId: string): Promise<Track[]> {
  // Gets the artist name for the search query
  const artist = await getArtist(artistId);

  const query = `artist:"${artist.name.replace(/"/g, "")}"`;

  const data = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`
  );

  const tracks: SpotifyTrack[] = data.tracks?.items ?? [];

  // Keeps songs belonging to the selected artist
  const artistTracks = tracks.filter((track) => {
    const belongsToArtist = track.artists?.some(
      (trackArtist) => trackArtist.id === artistId
    );

    return (
      track.id &&
      track.uri &&
      track.name &&
      belongsToArtist
    );
  });

  // Converts Spotify tracks into Purrify's Track format
  return artistTracks.map((track) => mapSpotifyTrack(track));
}

// Gets the artist's albums
export async function getArtistAlbums(artistId: string): Promise<ArtistAlbum[]> {
  const data = await spotifyFetch(
    `/artists/${encodeURIComponent(artistId)}/albums?include_groups=album&limit=10`
  );

  const albums: SpotifyAlbum[] = data.items ?? [];

  return albums
    .filter((album) => album.id)
    .map((album) => ({
      id: album.id,
      name: album.name,
      image: album.images?.[0]?.url ?? "",
      year: album.release_date?.slice(0, 4) ?? "",
      type: album.album_type ?? "album",
    }));
}