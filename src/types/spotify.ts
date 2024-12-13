export interface SpotifyTokens {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
  type: string;
  uri: string;
}
