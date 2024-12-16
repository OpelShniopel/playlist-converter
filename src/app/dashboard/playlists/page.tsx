"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { SpotifyPlaylists } from "@/components/spotify-playlists";

export default function PlaylistsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Playlists</h2>

        {/* Spotify Playlists Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <SpotifyPlaylists />
        </div>

        {/*/!* YouTube Playlists Section *!/*/}
        {/*<div className="bg-card border border-border rounded-lg p-6">*/}
        {/*  <YouTubePlaylists />*/}
        {/*</div>*/}
      </div>
    </DashboardLayout>
  );
}
