import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';

import { SpotifyPlaylist, SpotifyUserProfile } from '@/types/spotify';
import { db } from '@/lib/firebase/config';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

// Auth URLs and Config
export function getSpotifyAuthUrl() {
  const state = generateRandomString(16);
  const scope = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID!,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

  sessionStorage.setItem('spotify_auth_state', state);
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Auth Helper Functions
function generateRandomString(length: number) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Token Management
export function isTokenExpired(expiresAt: number): boolean {
  // Add 5-minute buffer to prevent edge cases
  return Date.now() >= expiresAt - 300000;
}

async function refreshSpotifyToken(userId: string, refreshToken: string) {
  try {
    const response = await fetch('/api/auth/spotify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'refresh_token',
        userId,
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export async function getValidSpotifyToken(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  const tokens = userData?.spotifyTokens;

  if (!tokens) {
    throw new Error('No Spotify tokens found');
  }

  if (isTokenExpired(tokens.expiresAt)) {
    console.log('Spotify token expired, refreshing...');
    return refreshSpotifyToken(userId, tokens.refreshToken);
  }

  return tokens;
}

// Data Fetching Functions
export async function fetchSpotifyPlaylists(
  userId: string
): Promise<SpotifyPlaylist[]> {
  try {
    const tokens = await getValidSpotifyToken(userId);

    const response = await axios.get(`${SPOTIFY_API_URL}/me/playlists`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    throw error;
  }
}

export async function getPlaylistTracks(
  userId: string,
  playlistId: string,
  url?: string
) {
  try {
    const tokens = await getValidSpotifyToken(userId);

    const requestUrl =
      url ?? `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`;

    const response = await axios.get(requestUrl, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    throw error;
  }
}

export async function fetchSpotifyUserProfile(
  userId: string
): Promise<SpotifyUserProfile> {
  try {
    const tokens = await getValidSpotifyToken(userId);

    const response = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Spotify user profile:', error);
    throw error;
  }
}
