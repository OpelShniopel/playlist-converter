"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="bg-card rounded-lg shadow p-6 border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Welcome to your Dashboard
        </h2>
        <p className="text-muted-foreground">
          Start by selecting one of your playlists to convert, or check your
          conversion history.
        </p>
      </div>
    </DashboardLayout>
  );
}
