import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { fetchYouTubePlaylists } from '@/services/youtube';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

import { YouTubePlaylist } from '@/types/youtube';

export function YouTubePlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlaylists() {
      if (!user?.connectedServices?.youtube) return;

      try {
        setLoading(true);
        const youtubePlaylist = await fetchYouTubePlaylists(user.id);
        setPlaylists(youtubePlaylist);
      } catch (err) {
        console.error('Error fetching YouTube playlists:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load playlists'
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [user]);

  // First, check if YouTube is connected
  if (!user?.connectedServices?.youtube) {
    return (
      <div className="py-8 text-center">
        <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          YouTube Not Connected
        </h3>
        <p className="mt-2 text-muted-foreground">
          Connect your YouTube account to see your playlists here.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow">
        <div className="text-center text-red-500">
          <p>Error loading playlists: {error}</p>
        </div>
      </div>
    );
  }

  if (!user?.connectedServices?.youtube) {
    return (
      <div className="py-8 text-center">
        <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          YouTube Not Connected
        </h3>
        <p className="mt-2 text-muted-foreground">
          Connect your YouTube account to see your playlists here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">YouTube Playlists</h2>
        <span className="text-muted-foreground">
          {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
          >
            <div className="relative aspect-square">
              {playlist.snippet.thumbnails.high?.url ? (
                <img
                  src={playlist.snippet.thumbnails.high.url}
                  alt={playlist.snippet.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <MusicalNoteIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="truncate font-semibold text-foreground">
                {playlist.snippet.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {playlist.contentDetails.itemCount} videos
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                By {playlist.snippet.channelTitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="py-12 text-center">
          <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No playlists found
          </h3>
          <p className="mt-2 text-muted-foreground">
            Create a playlist on YouTube to see it here.
          </p>
        </div>
      )}
    </div>
  );
}
