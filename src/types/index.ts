export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  connectedServices: {
    spotify: boolean;
    youtube: boolean;
  };
}

export interface Playlist {
  id: string;
  name: string;
  source: 'spotify' | 'youtube' | 'soundcloud';
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

export interface ServiceTokens {
  spotifyTokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scope: string;
  };
  googleTokens?: {
    accessToken: string;
    refreshToken?: string;
  };
}

export interface UserServices {
  uid: string;
  tokens: ServiceTokens;
  connectedServices: {
    spotify: boolean;
    youtube: boolean;
  };
  updatedAt: string;
}
