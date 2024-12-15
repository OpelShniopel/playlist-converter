import axios from "axios";
import { db, auth } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

// Setup Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/youtube");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.force-ssl");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");

// Token refresh state
let tokenRefreshPromise: Promise<string> | null = null;

// Cache the last valid token and its expiry
let cachedToken: { token: string; expiry: number } | null = null;

// Token Management
export async function getValidYouTubeToken(userId: string) {
  // Check cache first
  if (cachedToken && Date.now() < cachedToken.expiry) {
    return cachedToken.token;
  }

  const userDoc = await getDoc(doc(db, "users", userId));
  const userData = userDoc.data();
  const tokens = userData?.googleTokens;

  if (!tokens?.accessToken) {
    throw new Error("No YouTube tokens found");
  }

  // Cache the token with 55-minute expiry (tokens typically last 60 minutes)
  cachedToken = {
    token: tokens.accessToken,
    expiry: Date.now() + 55 * 60 * 1000,
  };

  return tokens.accessToken;
}

async function refreshToken(): Promise<string> {
  // If a refresh is already in progress, return the existing promise
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  // Create a new refresh promise
  tokenRefreshPromise = new Promise((resolve, reject) => {
    console.log("Starting token refresh...");
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);

        if (!credential?.accessToken) {
          throw new Error("Failed to get new access token");
        }

        // Update the cache with the new token
        cachedToken = {
          token: credential.accessToken,
          expiry: Date.now() + 55 * 60 * 1000,
        };

        resolve(credential.accessToken);
      })
      .catch((error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      })
      .finally(() => {
        // Clear the promise so future refreshes can occur
        tokenRefreshPromise = null;
      });
  });

  return tokenRefreshPromise;
}

async function fetchWithTokenRefresh<T>(
  accessToken: string,
  requestFn: (token: string) => Promise<T>
): Promise<T> {
  try {
    // First try with the cached/current token
    return await requestFn(accessToken);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear the cache since this token is invalid
      cachedToken = null;

      console.log("Token expired, getting fresh token...");
      const newToken = await refreshToken();
      return await requestFn(newToken);
    }
    throw error;
  }
}

// Playlist Management
export async function createYouTubePlaylist(
  userId: string,
  title: string,
  description: string = "",
  privacy: "private" | "public" | "unlisted" = "private"
) {
  try {
    const accessToken = await getValidYouTubeToken(userId);

    return await fetchWithTokenRefresh(accessToken, async (token) => {
      const response = await axios.post(
        `${YOUTUBE_API_URL}/playlists`,
        {
          snippet: {
            title,
            description,
          },
          status: {
            privacyStatus: privacy,
          },
        },
        {
          params: {
            part: "snippet,status",
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    });
  } catch (error) {
    console.error("Error creating YouTube playlist:", error);
    throw error;
  }
}

// Search functionality
export async function searchYouTubeVideo(
  userId: string,
  query: string,
  maxResults: number = 5
) {
  try {
    const accessToken = await getValidYouTubeToken(userId);

    return await fetchWithTokenRefresh(accessToken, async (token) => {
      const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults,
          videoCategoryId: "10", // Music category
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.items;
    });
  } catch (error) {
    console.error("Error searching YouTube:", error);
    throw error;
  }
}

// Add video to playlist
export async function addVideoToPlaylist(
  userId: string,
  playlistId: string,
  videoId: string,
  position?: number
) {
  try {
    const accessToken = await getValidYouTubeToken(userId);

    return await fetchWithTokenRefresh(accessToken, async (token) => {
      const response = await axios.post(
        `${YOUTUBE_API_URL}/playlistItems`,
        {
          snippet: {
            playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId,
            },
            position,
          },
        },
        {
          params: {
            part: "snippet",
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    });
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    throw error;
  }
}

// Get user's playlists
export async function fetchYouTubePlaylists(userId: string) {
  try {
    const accessToken = await getValidYouTubeToken(userId);

    return await fetchWithTokenRefresh(accessToken, async (token) => {
      const response = await axios.get(`${YOUTUBE_API_URL}/playlists`, {
        params: {
          part: "snippet,contentDetails",
          mine: true,
          maxResults: 50,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.items;
    });
  } catch (error) {
    console.error("Error fetching YouTube playlists:", error);
    throw error;
  }
}

// Get playlist items
export async function getPlaylistItems(
  userId: string,
  playlistId: string,
  maxResults: number = 50
) {
  try {
    const accessToken = await getValidYouTubeToken(userId);

    return await fetchWithTokenRefresh(accessToken, async (token) => {
      const response = await axios.get(`${YOUTUBE_API_URL}/playlistItems`, {
        params: {
          part: "snippet,contentDetails",
          playlistId,
          maxResults,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.items;
    });
  } catch (error) {
    console.error("Error fetching playlist items:", error);
    throw error;
  }
}
