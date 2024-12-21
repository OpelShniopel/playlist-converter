import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchSpotifyPlaylists } from "@/services/spotify";
import { SpotifyPlaylist } from "@/types/spotify";
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ConversionDialog } from "./conversion-dialog";
import { SpotifyPlaylistTracks } from "./spotify-playlist-tracks";

interface SelectedTracksMap {
  [playlistId: string]: string[];
}

type SortOption = "name" | "tracks" | "date";
type SortDirection = "asc" | "desc";

export function SpotifyPlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<SpotifyPlaylist[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(
    null
  );
  const [selectedTracks, setSelectedTracks] = useState<SelectedTracksMap>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
          err instanceof Error ? err.message : "Failed to load playlists"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [user]);

  // Filter and sort playlists
  useEffect(() => {
    let filtered = [...playlists];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "tracks") {
        return sortDirection === "asc"
          ? a.tracks.total - b.tracks.total
          : b.tracks.total - a.tracks.total;
      }
      return 0;
    });

    setFilteredPlaylists(filtered);
  }, [playlists, searchQuery, sortBy, sortDirection]);

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
      setSelectedPlaylist(playlist);
    } else {
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
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <h2 className="text-xl font-bold text-foreground">Spotify Playlists</h2>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
          {/* Search input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-64 rounded-md border border-border bg-background text-foreground"
            />
          </div>

          {/* Sort controls */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="name">Sort by Name</option>
              <option value="tracks">Sort by Tracks</option>
            </select>
            <button
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground hover:bg-muted"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaylists.map((playlist) => (
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
                      expandedPlaylistId === playlist.id ? null : playlist.id
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
                    ? `Convert ${
                        selectedTracks[playlist.id].length
                      } Selected Tracks`
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

      {filteredPlaylists.length === 0 && (
        <div className="text-center py-12">
          <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {searchQuery ? "No matching playlists found" : "No playlists found"}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create a playlist on Spotify to see it here."}
          </p>
        </div>
      )}
    </div>
  );
}
