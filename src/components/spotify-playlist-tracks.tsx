import { useCallback, useEffect, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

import { SpotifyTrack, SpotifyTrackItem } from '@/types/spotify';
import { getPlaylistTracks } from '@/services/spotify';

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
        console.error('Error loading tracks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tracks');
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
        className="mt-2 flex w-full items-center justify-center rounded-md py-2 transition-colors hover:bg-muted"
      >
        <ChevronDownIcon className="h-5 w-5" />
        <span className="ml-1">Show Tracks</span>
      </button>
    );
  }

  if (loading && !loadingMore) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={toggleAll}
          className="hover:text-primary/80 text-sm text-primary"
        >
          {selectedTracks.size === tracks.length
            ? 'Deselect All'
            : 'Select All'}
        </button>
        <button
          onClick={onToggleExpand}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ChevronUpIcon className="h-5 w-5" />
          <span className="ml-1">Hide Tracks</span>
        </button>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {tracks.map((track, index) => (
          <div
            key={track.id || `track-${index}`}
            className="flex cursor-pointer items-center rounded-md p-2 hover:bg-muted"
            onClick={() => toggleTrack(track.id)}
          >
            <div className="mr-3 flex h-6 w-6 items-center justify-center">
              {selectedTracks.has(track.id) ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
                  <CheckIcon className="h-4 w-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-md border-2 border-muted-foreground" />
              )}
            </div>
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="mr-3 h-10 w-10 rounded-md"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{track.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {track.artists.map((artist) => artist.name).join(', ')}
              </p>
            </div>
            <div className="ml-3 text-sm text-muted-foreground">
              {formatDuration(track.duration_ms)}
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={loadMoreTracks}
            className="hover:text-primary/80 mt-4 flex w-full items-center justify-center py-2 text-sm text-primary"
            disabled={loadingMore}
          >
            {loadingMore ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            ) : (
              'Load More Tracks'
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
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
