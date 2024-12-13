"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Profile Settings
        </h2>
        <p className="text-muted-foreground">
          Profile settings will appear here soon...
        </p>
      </div>
    </DashboardLayout>
  );
}
