import axios from "axios";
import { getValidSpotifyToken } from "./spotify";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export type TimeRange = {
  short_term: "short_term";
  medium_term: "medium_term";
  long_term: "long_term";
};

export interface TopItemData {
  id: string;
  name: string;
  image: string;
  subtitle: string;
  popularity: number;
}

export interface StatsOverviewData {
  uniqueArtists: number;
  totalTracks: number;
  topGenres: { name: string; count: number }[];
  averageDuration: number;
  totalDuration: number;
  popularityScore: number;
  mainstreamScore: number;
  popularityBreakdown: {
    mainstream: number;
    mixed: number;
    obscure: number;
  };
  topTracks: TopItemData[];
  topArtists: TopItemData[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
}

interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  images: Array<{ url: string }>;
  genres: string[];
}

const calculateMainstreamScore = (
  tracks: SpotifyTrack[],
): {
  mainstreamScore: number;
  popularityBreakdown: {
    mainstream: number;
    mixed: number;
    obscure: number;
  };
} => {
  const popularities = tracks.map((t) => t.popularity).sort((a, b) => a - b);

  const totalTracks = tracks.length;
  const q1 = popularities[Math.floor(totalTracks * 0.25)];
  const median = popularities[Math.floor(totalTracks * 0.5)];
  const q3 = popularities[Math.floor(totalTracks * 0.75)];

  // Instead of fixed thresholds, use quartiles:
  const MAINSTREAM_THRESHOLD = q3; // Top 25% considered mainstream
  const OBSCURE_THRESHOLD = q1; // Bottom 25% considered obscure

  // Categorize based on these dynamic thresholds
  const mainstreamCount = popularities.filter(
    (p) => p >= MAINSTREAM_THRESHOLD,
  ).length;
  const obscureCount = popularities.filter(
    (p) => p <= OBSCURE_THRESHOLD,
  ).length;
  const mixedCount = totalTracks - mainstreamCount - obscureCount;

  // Now calculate a score based on these relative measures
  const mainstreamPercentage = (mainstreamCount / totalTracks) * 100;
  const mixedPercentage = (mixedCount / totalTracks) * 100;
  const obscurePercentage = (obscureCount / totalTracks) * 100;

  // Perhaps define the mainstream score as primarily the mainstreamPercentage,
  // with a smaller contribution from mixed and subtracting obscure:
  const mainstreamScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        mainstreamPercentage + mixedPercentage * 0.5 - obscurePercentage * 0.25,
      ),
    ),
  );

  // Return data
  return {
    mainstreamScore,
    popularityBreakdown: {
      mainstream: Math.round(mainstreamPercentage),
      mixed: Math.round(mixedPercentage),
      obscure: Math.round(obscurePercentage),
    },
  };
};

export async function getStatsOverview(
  userId: string,
  timeRange: keyof TimeRange,
): Promise<StatsOverviewData> {
  try {
    const tokens = await getValidSpotifyToken(userId);

    // Get top tracks and artists data with proper type assertions
    const [tracksResponse, artistsResponse] = await Promise.all([
      axios.get<{ items: SpotifyTrack[] }>(`${SPOTIFY_API_URL}/me/top/tracks`, {
        params: {
          time_range: timeRange,
          limit: 50,
        },
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }),
      axios.get<{ items: SpotifyArtist[] }>(
        `${SPOTIFY_API_URL}/me/top/artists`,
        {
          params: {
            time_range: timeRange,
            limit: 50,
          },
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        },
      ),
    ]);

    const tracks = tracksResponse.data.items;
    const artists = artistsResponse.data.items;

    // Process tracks for visualization
    const processedTracks: TopItemData[] = tracks.map((track) => ({
      id: track.id,
      name: track.name,
      image: track.album.images[0]?.url || "",
      subtitle: track.artists.map((a) => a.name).join(", "),
      popularity: track.popularity,
    }));

    // Process artists for visualization
    const processedArtists: TopItemData[] = artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || "",
      subtitle: artist.genres.slice(0, 2).join(", "),
      popularity: artist.popularity,
    }));

    // Calculate totals and averages
    const totalDuration = tracks.reduce(
      (sum, track) => sum + track.duration_ms,
      0,
    );
    const averageDuration = Math.round(totalDuration / tracks.length);

    // Calculate mainstream score and popularity breakdown
    const { mainstreamScore, popularityBreakdown } =
      calculateMainstreamScore(tracks);

    // Process genres
    const genreCounts = artists.reduce<Record<string, number>>(
      (acc, artist) => {
        artist.genres.forEach((genre) => {
          acc[genre] = (acc[genre] || 0) + 1;
        });
        return acc;
      },
      {},
    );

    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      uniqueArtists: artists.length,
      totalTracks: tracks.length,
      topGenres,
      averageDuration,
      totalDuration,
      popularityScore: mainstreamScore, // For backward compatibility
      mainstreamScore,
      popularityBreakdown,
      topTracks: processedTracks,
      topArtists: processedArtists,
    };
  } catch (error) {
    console.error("Error fetching stats overview:", error);
    throw error;
  }
}

export async function getRecentlyPlayed(userId: string, limit: number = 50) {
  try {
    const tokens = await getValidSpotifyToken(userId);

    const response = await axios.get(
      `${SPOTIFY_API_URL}/me/player/recently-played`,
      {
        params: {
          limit,
        },
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    return response.data.items;
  } catch (error) {
    console.error("Error fetching recently played tracks:", error);
    throw error;
  }
}
