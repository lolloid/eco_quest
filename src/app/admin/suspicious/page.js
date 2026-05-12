"use client";

import { AdminShell, AdminState, useAdminApi } from "@/features/admin/AdminClient";

export default function AdminSuspiciousPage() {
  const { data, error, loading } = useAdminApi("/api/admin/suspicious");
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Suspicious Players">{state}</AdminShell>;

  return (
    <AdminShell title="Suspicious Players">
      <div className="glass-card p-5">
        {data.users.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada pemain mencurigakan.</p>
        ) : (
          <div className="space-y-3">
            {data.users.map((user) => (
              <div key={user.uid} className="flex items-center justify-between border-b border-pixel-border/50 pb-3">
                <div>
                  <p className="text-white">{user.displayName}</p>
                  <p className="text-gray-600 text-xs">{user.email}</p>
                </div>
                <span className="text-amber-400 font-semibold">Risk {user.suspiciousScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
