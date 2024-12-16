"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { UserProfile } from "@/components/user-profile";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>

        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <UserProfile />
        </div>
      </div>
    </DashboardLayout>
  );
}
