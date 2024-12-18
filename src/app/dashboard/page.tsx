"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { ConnectionStatus } from "@/components/connection-status";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Welcome to your Dashboard
        </h2>

        <ConnectionStatus />
      </div>
    </DashboardLayout>
  );
}
