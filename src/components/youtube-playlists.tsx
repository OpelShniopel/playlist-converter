import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchYouTubePlaylists } from "@/services/youtube";
import { YouTubePlaylist } from "@/types/youtube";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

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
        console.error("Error fetching YouTube playlists:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load playlists"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <div className="text-center text-red-500">
          <p>Error loading playlists: {error}</p>
        </div>
      </div>
    );
  }

  if (!user?.connectedServices?.youtube) {
    return (
      <div className="text-center py-8">
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
          {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
          >
            <div className="aspect-square relative">
              {playlist.snippet.thumbnails.high?.url ? (
                <img
                  src={playlist.snippet.thumbnails.high.url}
                  alt={playlist.snippet.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <MusicalNoteIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground truncate">
                {playlist.snippet.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {playlist.contentDetails.itemCount} videos
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                By {playlist.snippet.channelTitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="text-center py-12">
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
