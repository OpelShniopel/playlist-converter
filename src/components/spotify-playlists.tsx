import { useCallback, useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';

import { SpotifyPlaylist } from '@/types/spotify';
import { fetchSpotifyPlaylists } from '@/services/spotify';
import { useAuth } from '@/context/auth-context';

import { ConversionDialog } from './conversion-dialog';
import { SpotifyPlaylistTracks } from './spotify-playlist-tracks';

interface SelectedTracksMap {
  [playlistId: string]: string[];
}

type SortOption = 'name' | 'tracks';
type SortDirection = 'asc' | 'desc';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const canConvert =
    user?.connectedServices?.spotify && user?.connectedServices?.youtube;

  const filterAndSortPlaylists = useCallback(
    (
      playlists: SpotifyPlaylist[],
      query: string,
      sortBy: SortOption,
      sortDirection: SortDirection
    ) => {
      let filtered = [...playlists];

      // Apply search filter
      if (query) {
        filtered = filtered.filter((playlist) =>
          playlist.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortBy === 'name') {
          return sortDirection === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === 'tracks') {
          return sortDirection === 'asc'
            ? a.tracks.total - b.tracks.total
            : b.tracks.total - a.tracks.total;
        }
        return 0;
      });

      return filtered;
    },
    []
  );

  useEffect(() => {
    async function loadPlaylists() {
      if (!user?.connectedServices?.spotify) return;

      try {
        setLoading(true);
        const spotifyPlaylists = await fetchSpotifyPlaylists(user.id);
        setPlaylists(spotifyPlaylists);
      } catch (err) {
        console.error('Error fetching Spotify playlists:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load playlists'
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [user]);

  // Filter and sort playlists
  useEffect(() => {
    const filtered = filterAndSortPlaylists(
      playlists,
      searchQuery,
      sortBy,
      sortDirection
    );
    setFilteredPlaylists(filtered);
  }, [playlists, searchQuery, sortBy, sortDirection, filterAndSortPlaylists]);

  if (!user?.connectedServices?.spotify) {
    return (
      <div className="py-8 text-center">
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

  const getConvertButtonText = (
    canConvert: boolean | undefined,
    playlistId: string,
    selectedTracks: { [playlistId: string]: string[] }
  ): string => {
    // Ensure canConvert is a boolean
    const isConvertEnabled = Boolean(canConvert);

    if (!isConvertEnabled) {
      return 'Connect YouTube to Convert';
    }

    const selectedTrackCount = selectedTracks[playlistId]?.length || 0;
    if (selectedTrackCount > 0) {
      return `Convert ${selectedTrackCount} Selected Tracks`;
    }

    return 'Convert Entire Playlist';
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
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
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-foreground md:w-64"
            />
          </div>

          {/* Sort controls */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            >
              <option value="name">Sort by Name</option>
              <option value="tracks">Sort by Tracks</option>
            </select>
            <button
              onClick={() =>
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground hover:bg-muted"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
          >
            <div className="relative aspect-square">
              {playlist.images[0] ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
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
                {playlist.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {playlist.tracks.total} tracks
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
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
                className={`mt-3 w-full rounded-md px-3 py-2 transition-all ${
                  canConvert
                    ? 'bg-primary text-primary-foreground opacity-100'
                    : 'cursor-not-allowed bg-gray-200 text-gray-500'
                }`}
                disabled={!canConvert}
                onClick={() => handleConvertSelected(playlist)}
              >
                {getConvertButtonText(canConvert, playlist.id, selectedTracks)}
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
        <div className="py-12 text-center">
          <MusicalNoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {searchQuery ? 'No matching playlists found' : 'No playlists found'}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create a playlist on Spotify to see it here.'}
          </p>
        </div>
      )}
    </div>
  );
}
