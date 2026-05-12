"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/quests", label: "Quests" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/npcs", label: "NPCs" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/suspicious", label: "Suspicious" },
];

export function AdminShell({ title, children }) {
  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <div className="glass-card p-4 sticky top-24">
            <h2 className="font-pixel text-sm text-eco-400 mb-4">ADMIN</h2>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-eco-400 hover:bg-eco-500/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <section className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="font-pixel text-lg text-eco-400 mb-2">{title}</h1>
            <p className="text-gray-500 text-sm">Operational dashboard untuk mengelola EcoQuest.</p>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}

export function useAdminApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Login sebagai admin terlebih dahulu.");

        const res = await fetch(path, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Admin API gagal.");
        if (mounted) setData(json);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [path]);

  return { data, error, loading };
}

export function AdminState({ loading, error }) {
  if (loading) {
    return <div className="glass-card p-6 text-gray-400">Memuat data admin...</div>;
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/30">
        <p className="text-red-400 font-semibold mb-1">Akses admin gagal</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return null;
}

export function StatCard({ label, value, subtitle }) {
  return (
    <div className="glass-card p-5">
      <p className="text-gray-500 text-xs mb-2">{label}</p>
      <p className="font-pixel text-xl text-eco-400">{value}</p>
      {subtitle && <p className="text-gray-600 text-xs mt-2">{subtitle}</p>}
    </div>
  );
}
