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
  };
  owner: {
    display_name: string;
    id: string;
  };
  public: boolean;
  collaborative: boolean;
  snapshot_id: string;
}
