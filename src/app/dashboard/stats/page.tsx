"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { StatsOverview } from "@/components/stats/stats-overview";
import { TopItemsVisualization } from "@/components/stats/top-items-visualization";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import {
  TimeRange,
  getStatsOverview,
  StatsOverviewData,
} from "@/services/spotify-stats";

export default function StatsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsOverviewData | null>(null);
  const [timeRange, setTimeRange] = useState<keyof TimeRange>("medium_term");

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await getStatsOverview(user.id, timeRange);
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user?.id, timeRange]);

  if (!user?.connectedServices?.spotify) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Your Music Stats
          </h2>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Connect Spotify to See Your Stats
              </h3>
              <p className="mt-2 text-muted-foreground">
                Connect your Spotify account to get insights about your music
                listening habits.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Your Music Stats
          </h2>
        </div>

        <StatsOverview onTimeRangeChange={setTimeRange} />

        {/* Top Items Visualizations */}
        {!loading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <TopItemsVisualization
                title="Top Artists"
                items={stats.topArtists}
                loading={loading}
              />
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <TopItemsVisualization
                title="Top Tracks"
                items={stats.topTracks}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
