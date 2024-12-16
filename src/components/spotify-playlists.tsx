import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchSpotifyPlaylists } from "@/services/spotify";
import { SpotifyPlaylist } from "@/types/spotify";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";
import { ConversionDialog } from "./conversion-dialog";
import { SpotifyPlaylistTracks } from "./spotify-playlist-tracks";

interface SelectedTracksMap {
  [playlistId: string]: string[];
}

export function SpotifyPlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(
    null,
  );
  const [selectedTracks, setSelectedTracks] = useState<SelectedTracksMap>({});

  const canConvert =
    user?.connectedServices?.spotify && user?.connectedServices?.youtube;

  useEffect(() => {
    async function loadPlaylists() {
      if (!user?.connectedServices?.spotify) return;

      try {
        setLoading(true);
        const spotifyPlaylists = await fetchSpotifyPlaylists(user.id);
        setPlaylists(spotifyPlaylists);
      } catch (err) {
        console.error("Error fetching Spotify playlists:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load playlists",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [user]);

  if (!user?.connectedServices?.spotify) {
    return (
      <div className="text-center py-8">
        <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          Spotify Not Connected
        </h3>
        <p className="mt-2 text-muted-foreground">
          Connect your Spotify account to see your playlists here.
        </p>
      </div>
    );
  }

  const handleTrackSelect = (playlistId: string, trackIds: string[]) => {
    setSelectedTracks((prev) => ({
      ...prev,
      [playlistId]: trackIds,
    }));
  };

  const handleConvertSelected = (playlist: SpotifyPlaylist) => {
    const playlistSelectedTracks = selectedTracks[playlist.id] || [];
    if (playlistSelectedTracks.length === 0) {
      // Convert entire playlist
      setSelectedPlaylist(playlist);
    } else {
      // Convert selected tracks
      setSelectedPlaylist({
        ...playlist,
        tracks: {
          ...playlist.tracks,
          total: playlistSelectedTracks.length,
          selectedIds: playlistSelectedTracks,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error loading playlists: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Spotify Playlists</h2>
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
              {playlist.images[0] ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
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
                {playlist.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {playlist.tracks.total} tracks
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                By {playlist.owner.display_name}
              </p>

              {user?.id && (
                <SpotifyPlaylistTracks
                  playlistId={playlist.id}
                  userId={user.id}
                  onTrackSelect={(trackIds) =>
                    handleTrackSelect(playlist.id, trackIds)
                  }
                  isExpanded={expandedPlaylistId === playlist.id}
                  onToggleExpand={() =>
                    setExpandedPlaylistId(
                      expandedPlaylistId === playlist.id ? null : playlist.id,
                    )
                  }
                />
              )}

              <button
                className={`mt-3 w-full py-2 px-3 rounded-md transition-all ${
                  canConvert
                    ? "bg-primary text-primary-foreground opacity-100"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!canConvert}
                onClick={() => handleConvertSelected(playlist)}
              >
                {canConvert
                  ? (selectedTracks[playlist.id]?.length || 0) > 0
                    ? `Convert ${selectedTracks[playlist.id].length} Selected Tracks`
                    : "Convert Entire Playlist"
                  : "Connect YouTube to Convert"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlaylist && (
        <ConversionDialog
          playlistId={selectedPlaylist.id}
          playlistName={selectedPlaylist.name}
          selectedTracks={selectedTracks[selectedPlaylist.id] || []}
          isOpen={!!selectedPlaylist}
          onClose={() => {
            setSelectedPlaylist(null);
            setSelectedTracks((prev) => ({
              ...prev,
              [selectedPlaylist.id]: [],
            }));
          }}
        />
      )}

      {playlists.length === 0 && (
        <div className="text-center py-12">
          <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No playlists found
          </h3>
          <p className="mt-2 text-muted-foreground">
            Create a playlist on Spotify to see it here.
          </p>
        </div>
      )}
    </div>
  );
}
