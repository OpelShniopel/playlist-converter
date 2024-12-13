"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";

export default function PlaylistsPage() {
  return (
    <DashboardLayout>
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          My Playlists
        </h2>
        <p className="text-muted-foreground">
          Your playlists will appear here soon...
        </p>
      </div>
    </DashboardLayout>
  );
}
