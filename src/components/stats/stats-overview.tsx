import { useState, useEffect } from "react";
import {
  TimeRange,
  StatsOverviewData,
  getStatsOverview,
} from "@/services/spotify-stats";
import { useAuth } from "@/context/auth-context";
import { StatCard } from "./stat-card";
import { ClockIcon, ChartBarIcon, TagIcon } from "@heroicons/react/24/outline";

interface StatsOverviewProps {
  onTimeRangeChange: (range: keyof TimeRange) => void;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

export function StatsOverview({
  onTimeRangeChange,
}: Readonly<StatsOverviewProps>) {
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] =
    useState<keyof TimeRange>("medium_term");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsOverviewData | null>(null);

  const timeRanges = [
    {
      value: "short_term",
      label: "Last 4 Weeks",
      description: "Your top 50 artists and tracks from the last 4 weeks",
    },
    {
      value: "medium_term",
      label: "Last 6 Months",
      description: "Your top 50 artists and tracks from the last 6 months",
    },
    {
      value: "long_term",
      label: "All Time",
      description:
        "Your top 50 artists and tracks across your entire listening history",
    },
  ] as const;

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await getStatsOverview(user.id, selectedRange);
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user?.id, selectedRange]);

  const handleRangeChange = (range: keyof TimeRange) => {
    setSelectedRange(range);
    onTimeRangeChange(range);
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`group relative px-4 py-2 rounded-md transition-colors ${
              selectedRange === range.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <span>{range.label}</span>

            {/* Tooltip */}
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs
                          bg-background border border-border rounded-md whitespace-nowrap opacity-0
                          group-hover:opacity-100 transition-opacity"
            >
              {range.description}
            </div>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Listening Time Card */}
        <StatCard
          icon={<ClockIcon className="h-6 w-6" />}
          title="Top Tracks Listening Time"
          tooltip="Total time spent listening to your top 50 tracks in this period"
          loading={loading}
          expandable
          expandedContent={
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Time Distribution</h4>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${((stats?.averageDuration ?? 0) / (stats?.totalDuration ?? 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="font-medium">
                    {formatDuration(stats?.totalDuration ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Per Track
                  </p>
                  <p className="font-medium">
                    {formatDuration(stats?.averageDuration ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          }
        >
          <div>
            <p className="text-2xl font-semibold">
              {formatDuration(stats?.totalDuration ?? 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              avg. {formatDuration(stats?.averageDuration ?? 0)} per track
            </p>
          </div>
        </StatCard>

        {/* Genres Card */}
        <StatCard
          icon={<TagIcon className="h-6 w-6" />}
          title="Top Genres"
          tooltip="Most common genres among your top artists"
          loading={loading}
          expandable
          expandedContent={
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Genre Distribution</h4>
                <div className="space-y-2">
                  {stats?.topGenres.map((genre) => (
                    <div key={genre.name}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{genre.name}</span>
                        <span>
                          {Math.round(
                            (genre.count / (stats?.uniqueArtists || 1)) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(genre.count / (stats?.uniqueArtists || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <div className="space-y-1">
            {stats?.topGenres.slice(0, 3).map((genre) => (
              <div
                key={genre.name}
                className="flex items-center justify-between"
              >
                <span className="text-sm capitalize">{genre.name}</span>
                <span className="text-sm text-muted-foreground">
                  {genre.count} artists
                </span>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Popularity Score Card */}
        <StatCard
          icon={<ChartBarIcon className="h-6 w-6" />}
          title="Music Taste"
          tooltip="Analysis of how mainstream or underground your music taste is"
          loading={loading}
          expandable
          expandedContent={
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Taste Breakdown</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Mainstream</span>
                      <span>
                        {stats?.popularityBreakdown?.mainstream ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${stats?.popularityBreakdown?.mainstream ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Mixed</span>
                      <span>{stats?.popularityBreakdown?.mixed ?? 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{
                          width: `${stats?.popularityBreakdown?.mixed ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Underground</span>
                      <span>{stats?.popularityBreakdown?.obscure ?? 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 transition-all duration-500"
                        style={{
                          width: `${stats?.popularityBreakdown?.obscure ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <div>
            <p className="text-2xl font-semibold">
              {calculateDisplayScore(stats?.popularityBreakdown)}
            </p>
            <p className="text-sm text-muted-foreground">
              {getMainstreamLabel(
                calculateDisplayScore(stats?.popularityBreakdown),
              )}
            </p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${calculateDisplayScore(stats?.popularityBreakdown)}%`,
                }}
              />
            </div>
          </div>
        </StatCard>
      </div>
    </div>
  );
}

// Helper functions
function calculateDisplayScore(
  breakdown:
    | {
        mainstream: number;
        mixed: number;
        obscure: number;
      }
    | undefined,
): number {
  if (!breakdown) return 0;

  // Calculate score giving different weights to each category
  const score =
    breakdown.mainstream + // full weight to mainstream
    breakdown.mixed * 0.5 - // half-weight to mixed
    breakdown.obscure * 0.2; // some penalty for obscure

  return Math.round(score);
}

function getMainstreamLabel(score: number): string {
  if (score >= 70) return "Very Mainstream";
  if (score >= 30) return "Mixed Taste";
  return "Underground";
}
