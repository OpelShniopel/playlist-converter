export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Playlist {
  id: string;
  name: string;
  source: "spotify" | "youtube" | "soundcloud";
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}
