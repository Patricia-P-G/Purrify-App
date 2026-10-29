import type { Track } from "@/types/music";

export interface TrackArtist {
  name: string;
  id?: string;
}

// Returns each artist of a track with its id, so it can link to the artist page
export function getTrackArtists(track: Track): TrackArtist[] {
  if (track.artists?.length) return track.artists;

  // Fallback for older saved tracks that only have the artist names
  return track.artist
    .split(/,\s*/)
    .filter(Boolean)
    .map((name, index) => ({ name, id: index === 0 ? track.artistId : undefined }));
}