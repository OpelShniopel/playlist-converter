export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
  type: string;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
    href: string;
    selectedIds?: string[]; // Add this optional property
  };
  owner: {
    display_name: string;
    id: string;
  };
  public: boolean;
  collaborative: boolean;
  snapshot_id: string;
}

export interface SpotifyTrackItem {
  track: SpotifyTrack;
  added_at: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
    uri: string;
  }[];
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  duration_ms: number;
  uri: string;
}
