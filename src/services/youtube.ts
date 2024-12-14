import axios from "axios";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

// Token Management
export async function getValidYouTubeToken(userId: string) {
  const userDoc = await getDoc(doc(db, "users", userId));
  const userData = userDoc.data();
  const tokens = userData?.googleTokens;

  if (!tokens?.accessToken) {
    throw new Error("No YouTube tokens found");
  }

  return tokens.accessToken;
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
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
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

    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults,
        videoCategoryId: "10", // Music category
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.items;
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
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    throw error;
  }
}

// Get user's playlists
export async function fetchYouTubePlaylists(userId: string) {
  try {
    const accessToken = await getValidYouTubeToken(userId);

    const response = await axios.get(`${YOUTUBE_API_URL}/playlists`, {
      params: {
        part: "snippet,contentDetails",
        mine: true,
        maxResults: 50,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.items;
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

    const response = await axios.get(`${YOUTUBE_API_URL}/playlistItems`, {
      params: {
        part: "snippet,contentDetails",
        playlistId,
        maxResults,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.items;
  } catch (error) {
    console.error("Error fetching playlist items:", error);
    throw error;
  }
}
