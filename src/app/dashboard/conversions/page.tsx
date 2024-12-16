"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { ConversionHistory } from "@/components/conversion-history";
import { useAuth } from "@/context/auth-context";

export default function ConversionsPage() {
  const { user } = useAuth();
  const bothServicesConnected =
    user?.connectedServices?.spotify && user?.connectedServices?.youtube;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">
          Conversion History
        </h2>

        {!bothServicesConnected ? (
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-muted-foreground">
              Connect both Spotify and YouTube to see your conversion history.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-6">
            <ConversionHistory />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
