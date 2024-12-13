"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";

export default function ConversionsPage() {
  return (
    <DashboardLayout>
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Conversion History
        </h2>
        <p className="text-muted-foreground">
          Your conversion history will appear here...
        </p>
      </div>
    </DashboardLayout>
  );
}
