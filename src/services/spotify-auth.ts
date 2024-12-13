import axios from "axios";
import { SpotifyTokens, SpotifyUserProfile } from "@/types/spotify";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

function generateRandomString(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export function getSpotifyAuthUrl() {
  const state = generateRandomString(16);
  const scope = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID!,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

  sessionStorage.setItem("spotify_auth_state", state);
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function fetchSpotifyUserProfile(
  accessToken: string,
): Promise<SpotifyUserProfile> {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Spotify user profile:", error);
    throw error;
  }
}

// Helper to check if tokens are expired
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

// Store tokens with expiration
export function storeSpotifyTokens(tokens: SpotifyTokens) {
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  localStorage.setItem(
    "spotify_tokens",
    JSON.stringify({
      ...tokens,
      expires_at: expiresAt,
    }),
  );
}

// Get stored tokens
export function getStoredSpotifyTokens():
  | (SpotifyTokens & { expires_at: number })
  | null {
  const tokens = localStorage.getItem("spotify_tokens");
  return tokens ? JSON.parse(tokens) : null;
}
