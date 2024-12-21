'use client';

import { ConnectionStatus } from '@/components/connection-status';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Welcome to your Dashboard
        </h2>

        <ConnectionStatus />
      </div>
    </DashboardLayout>
  );
}
