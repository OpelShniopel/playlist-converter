import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { fetchSpotifyPlaylists, getValidSpotifyToken } from "./spotify";
import {
  searchYouTubeVideo,
  createYouTubePlaylist,
  addVideoToPlaylist,
} from "./youtube";

interface ConversionProgress {
  processed: number;
  total: number;
  currentTrack: string;
}

interface Conversion {
  userId: string;
  sourcePlaylistId: string;
  sourceType: "spotify" | "youtube";
  targetPlaylistId?: string;
  targetType: "spotify" | "youtube";
  status: "processing" | "completed" | "failed";
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface SpotifyPlaylistTrackObject {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
  };
}

export async function convertSpotifyToYouTube(
  userId: string,
  spotifyPlaylistId: string,
  onProgress?: (progress: ConversionProgress) => void,
  selectedTrackIds?: string[], // Add this parameter
) {
  try {
    // Create conversion record
    const conversionRef = await addDoc(collection(db, "conversions"), {
      userId,
      sourcePlaylistId: spotifyPlaylistId,
      sourceType: "spotify",
      targetType: "youtube",
      status: "processing",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Fetch Spotify playlist details
    const spotifyPlaylists = await fetchSpotifyPlaylists(userId);
    const playlist = spotifyPlaylists.find((p) => p.id === spotifyPlaylistId);
    const tokens = await getValidSpotifyToken(userId);

    if (!playlist) {
      throw new Error("Spotify playlist not found");
    }

    // Create YouTube playlist
    const youtubePlaylist = await createYouTubePlaylist(
      userId,
      `${playlist.name} (from Spotify)`,
      playlist.description || "Converted from Spotify",
      "private",
    );

    // Update conversion record with target playlist ID
    await updateDoc(conversionRef, {
      targetPlaylistId: youtubePlaylist.id,
    });

    // Fetch all tracks from Spotify playlist
    const response = await fetch(`${playlist.tracks.href}`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const tracksData = await response.json();
    let tracks = tracksData.items;

    // Filter tracks if selectedTrackIds is provided
    if (selectedTrackIds && selectedTrackIds.length > 0) {
      tracks = tracks.filter((track: SpotifyPlaylistTrackObject) =>
        selectedTrackIds.includes(track.track.id),
      );
    }

    // Convert tracks
    let processed = 0;
    for (const track of tracks) {
      try {
        const searchQuery = `${track.track.name} ${track.track.artists[0].name} official`;
        const searchResults = await searchYouTubeVideo(userId, searchQuery, 1);

        if (searchResults && searchResults.length > 0) {
          await addVideoToPlaylist(
            userId,
            youtubePlaylist.id,
            searchResults[0].id.videoId,
          );
        }

        processed++;
        const progress = (processed / tracks.length) * 100;

        await updateDoc(conversionRef, {
          progress,
          updatedAt: new Date().toISOString(),
        });

        onProgress?.({
          processed,
          total: tracks.length,
          currentTrack: track.track.name,
        });
      } catch (error) {
        console.error(`Error converting track: ${track.track.name}`, error);
      }
    }

    await updateDoc(conversionRef, {
      status: "completed",
      progress: 100,
      updatedAt: new Date().toISOString(),
    });

    return youtubePlaylist;
  } catch (error) {
    console.error("Conversion error:", error);
    throw error;
  }
}

export async function getConversionHistory(userId: string) {
  const conversionsRef = collection(db, "conversions");
  const q = query(conversionsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (Conversion & { id: string })[];
}

export async function deleteConversion(conversionId: string) {
  try {
    const conversionRef = doc(db, "conversions", conversionId);
    await deleteDoc(conversionRef);
  } catch (error) {
    console.error("Error deleting conversion:", error);
    throw error;
  }
}
