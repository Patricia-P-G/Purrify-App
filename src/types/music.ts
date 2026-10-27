// Main track structure used throughout Purrify
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artists?: {
    id: string;
    name: string;
  }[];
  image: string;
  largeImage?: string;
  uri: string;
  album: string;
  albumId: string;
  duration: number;
}

// Extends Track with information needed for recently played songs
export interface RecentlyPlayedTrack extends Track {
  largeImage: string;
  playedAt: string;
  artists: {
    id: string;
    name: string;
  }[];
}

// Main artist structure used throughout Purrify
export interface Artist {
  id: string;
  name: string;
  image: string;
}