"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { SpotifyPlaylists } from "@/components/spotify-playlists";
import { YouTubePlaylists } from "@/components/youtube-playlists";

export default function PlaylistsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">My Playlists</h2>

        {/* Services Description */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground">
            Connect both Spotify and YouTube to enable playlist conversion. Once
            connected, you can convert playlists between platforms.
          </p>
        </div>

        {/* Spotify Playlists Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <SpotifyPlaylists />
        </div>

        {/* YouTube Playlists Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <YouTubePlaylists />
        </div>
      </div>
    </DashboardLayout>
  );
}
