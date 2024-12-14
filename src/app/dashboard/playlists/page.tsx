"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { fetchSpotifyPlaylists } from "@/services/spotify";
import { SpotifyPlaylist } from "@/types/spotify";
import { useEffect, useState } from "react";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canConvert =
    user?.connectedServices?.spotify && user?.connectedServices?.youtube;

  useEffect(() => {
    async function loadPlaylists() {
      if (!user) return;

      try {
        setLoading(true);
        const spotifyPlaylists = await fetchSpotifyPlaylists(user.id);
        setPlaylists(spotifyPlaylists);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load playlists",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <div className="text-center text-red-500">
            <p>Error loading playlists: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">My Playlists</h2>
          <span className="text-muted-foreground">
            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
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
                <button
                  className={`mt-3 w-full py-2 px-3 rounded-md transition-all ${
                    canConvert
                      ? "bg-primary text-primary-foreground opacity-0 group-hover:opacity-100"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!canConvert}
                  onClick={() => {
                    if (canConvert) {
                      console.log("Convert playlist:", playlist.id);
                    }
                  }}
                >
                  {canConvert
                    ? "Convert Playlist"
                    : "Connect YouTube to Convert"}
                </button>
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
              Link your Spotify account to see your playlists here.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
