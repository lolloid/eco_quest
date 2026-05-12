"use client";

import { AdminShell, AdminState, useAdminApi } from "@/features/admin/AdminClient";

export default function AdminUsersPage() {
  const { data, error, loading } = useAdminApi("/api/admin/users");
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Users">{state}</AdminShell>;

  return (
    <AdminShell title="Users">
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pixel-darker text-gray-500">
              <tr>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Level</th>
                <th className="text-left p-3">EP</th>
                <th className="text-left p-3">Trash</th>
                <th className="text-left p-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.uid} className="border-t border-pixel-border/50">
                  <td className="p-3">
                    <p className="text-white">{user.displayName}</p>
                    <p className="text-gray-600 text-xs">{user.email}</p>
                  </td>
                  <td className="p-3 text-gray-400">{user.role}</td>
                  <td className="p-3 text-gray-400">{user.level}</td>
                  <td className="p-3 text-eco-400">{user.totalEcoPoints}</td>
                  <td className="p-3 text-gray-400">{user.trashCollected}</td>
                  <td className="p-3 text-amber-400">{user.suspiciousScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
