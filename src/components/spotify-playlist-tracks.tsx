import { useState, useEffect, useCallback } from "react";
import { getPlaylistTracks } from "@/services/spotify";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { SpotifyTrack, SpotifyTrackItem } from "@/types/spotify";

interface SpotifyPlaylistTracksProps {
  playlistId: string;
  userId: string;
  onTrackSelect: (trackIds: string[]) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function SpotifyPlaylistTracks({
  playlistId,
  userId,
  onTrackSelect,
  isExpanded,
  onToggleExpand,
}: Readonly<SpotifyPlaylistTracksProps>) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  type Track = SpotifyTrack;

  const loadTracks = useCallback(
    async (url?: string) => {
      try {
        setLoading(true);
        const trackList = await getPlaylistTracks(userId, playlistId, url);

        // Update next URL and hasMore flag
        setNextUrl(trackList.next);
        setHasMore(!!trackList.next);

        // If this is the first load or a reset, replace tracks
        // If this is "load more", append tracks
        setTracks((current) =>
          url
            ? [
                ...current,
                ...trackList.items.map((item: SpotifyTrackItem) => item.track),
              ]
            : trackList.items.map((item: SpotifyTrackItem) => item.track)
        );
      } catch (err) {
        console.error("Error loading tracks:", err);
        setError(err instanceof Error ? err.message : "Failed to load tracks");
      } finally {
        setLoading(false);
      }
    },
    [playlistId, userId]
  );

  const loadMoreTracks = async () => {
    if (!nextUrl || loadingMore) return;

    try {
      setLoadingMore(true);
      await loadTracks(nextUrl);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadTracks();
    }
  }, [isExpanded, loadTracks]);

  const toggleTrack = (trackId: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
    onTrackSelect(Array.from(newSelected));
  };

  const toggleAll = () => {
    if (selectedTracks.size === tracks.length) {
      setSelectedTracks(new Set());
      onTrackSelect([]);
    } else {
      const allTrackIds = tracks.map((track) => track.id);
      setSelectedTracks(new Set(allTrackIds));
      onTrackSelect(allTrackIds);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-center mt-2 py-2 hover:bg-muted rounded-md transition-colors"
      >
        <ChevronDownIcon className="h-5 w-5" />
        <span className="ml-1">Show Tracks</span>
      </button>
    );
  }

  if (loading && !loadingMore) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        Error loading tracks: {error}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={toggleAll}
          className="text-sm text-primary hover:text-primary/80"
        >
          {selectedTracks.size === tracks.length
            ? "Deselect All"
            : "Select All"}
        </button>
        <button
          onClick={onToggleExpand}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ChevronUpIcon className="h-5 w-5" />
          <span className="ml-1">Hide Tracks</span>
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tracks.map((track, index) => (
          <div
            key={track.id || `track-${index}`}
            className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
            onClick={() => toggleTrack(track.id)}
          >
            <div className="w-6 h-6 flex items-center justify-center mr-3">
              {selectedTracks.has(track.id) ? (
                <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-muted-foreground rounded-md" />
              )}
            </div>
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-10 h-10 rounded-md mr-3"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>
            <div className="text-sm text-muted-foreground ml-3">
              {formatDuration(track.duration_ms)}
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={loadMoreTracks}
            className="w-full py-2 mt-4 text-sm text-primary hover:text-primary/80 flex items-center justify-center"
            disabled={loadingMore}
          >
            {loadingMore ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
            ) : (
              "Load More Tracks"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
