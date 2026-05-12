"use client";

import { AdminShell, AdminState, StatCard, useAdminApi } from "@/features/admin/AdminClient";

export default function AdminAnalyticsPage() {
  const { data, error, loading } = useAdminApi("/api/analytics/summary");
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Analytics">{state}</AdminShell>;

  const analytics = data.analytics;

  return (
    <AdminShell title="Analytics">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Users Estimate" value={analytics.activeUsersEstimate} />
        <StatCard label="Quest Completion Rate" value={`${analytics.questCompletionRate}%`} />
        <StatCard label="Trash Collected" value={analytics.trashCollected} />
        <StatCard label="Articles Read" value={analytics.articlesRead} />
      </div>
    </AdminShell>
  );
}
