"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { ConnectionStatus } from "@/components/connection-status";
// import { YouTubePlaylists } from "@/components/youtube-playlists";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Welcome to your Dashboard
        </h2>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-muted-foreground">
            Connect both Spotify and YouTube to start converting your playlists.
            Once connected, go to the Playlists page to select a playlist to
            convert.
          </p>
        </div>

        <ConnectionStatus />
      </div>
    </DashboardLayout>
  );
}
