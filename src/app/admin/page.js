"use client";

import { AdminShell, AdminState, StatCard, useAdminApi } from "@/features/admin/AdminClient";

export default function AdminOverviewPage() {
  const { data, error, loading } = useAdminApi("/api/admin/summary");
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Overview">{state}</AdminShell>;

  const summary = data.summary;

  return (
    <AdminShell title="Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={summary.totalUsers} />
        <StatCard label="EcoPoints" value={summary.totalEcoPoints.toLocaleString()} />
        <StatCard label="Trash Collected" value={summary.totalTrashCollected.toLocaleString()} />
        <StatCard label="Suspicious Users" value={summary.suspiciousUsers} />
      </div>
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4">Top Players</h2>
        <div className="space-y-3">
          {summary.topUsers.map((user) => (
            <div key={user.uid} className="flex items-center justify-between border-b border-pixel-border/50 pb-3">
              <div>
                <p className="text-white text-sm">{user.rank}. {user.displayName}</p>
                <p className="text-gray-500 text-xs">Lv.{user.level} • {user.title}</p>
              </div>
              <span className="badge-eco">{user.totalEcoPoints.toLocaleString()} EP</span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
