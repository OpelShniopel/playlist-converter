'use client';

import { useAuth } from '@/context/auth-context';
import { ConversionHistory } from '@/components/conversion-history';
import DashboardLayout from '@/components/layout/dashboard-layout';

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
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">
              Connect both Spotify and YouTube to see your conversion history.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6">
            <ConversionHistory />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
