"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearSessionCookie } from "@/lib/authSession";
import PixelIcon from "@/components/ui/PixelIcon";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "warrior" },
  { href: "/admin/quests", label: "Quests", icon: "quest" },
  { href: "/admin/articles", label: "Articles", icon: "book" },
  { href: "/admin/npcs", label: "NPCs", icon: "robot" },
  { href: "/admin/quizzes", label: "Quizzes", icon: "scroll" },
  { href: "/admin/analytics", label: "Analytics", icon: "rank" },
  { href: "/admin/suspicious", label: "Suspicious", icon: "shield" },
];

export function AdminShell({ title, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const adminEmail = auth.currentUser?.email || "admin console";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await clearSessionCookie();
      if (auth.currentUser) {
        await signOut(auth);
      }
      toast.success("Admin logout berhasil.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Admin logout failed:", error);
      toast.error("Gagal logout admin.");
    }
  };

  return (
    <div className="admin-console-shell min-h-screen">
      <div className="admin-console-bg" aria-hidden="true" />
      <div className="admin-console-wrap">
        <header className="admin-command-bar">
          <Link href="/admin" className="admin-brand" aria-label="EcoQuest Admin Overview">
            <PixelIcon type="shield" className="is-nav" />
            <span>
              <strong>EcoQuest</strong>
              <small>Admin Control</small>
            </span>
          </Link>

          <div className="admin-status-strip">
            <span className="admin-online-dot" />
            <span>SECURE SESSION</span>
            <em>{adminEmail}</em>
          </div>

          <div className="admin-command-actions">
            <button
              type="button"
              className={`admin-menu-toggle ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Buka menu admin"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>

            <button type="button" className="admin-logout-button" onClick={handleLogout}>
              <PixelIcon type="logout" className="is-tiny" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <button
          type="button"
          className={`admin-mobile-backdrop ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup menu admin"
          tabIndex={menuOpen ? 0 : -1}
        />

        <div className={`admin-mobile-drawer ${menuOpen ? "is-open" : ""}`}>
          <div className="admin-mobile-drawer-head">
            <span>ADMIN MENU</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Tutup menu admin">
              x
            </button>
          </div>
          <nav className="admin-mobile-nav-list" aria-label="Mobile admin navigation">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`admin-nav-item ${active ? "is-active" : ""}`}
                >
                  <PixelIcon type={item.icon} className="is-tiny" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button type="button" className="admin-mobile-logout" onClick={handleLogout}>
              <PixelIcon type="logout" className="is-tiny" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="admin-layout-grid">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-title">
              <span>ADMIN MODULES</span>
              <i />
            </div>
            <nav className="admin-nav-list" aria-label="Admin navigation">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-item ${active ? "is-active" : ""}`}
                  >
                    <PixelIcon type={item.icon} className="is-tiny" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="admin-content-panel">
            <div className="admin-page-heading">
              <div>
                <span className="admin-kicker">OPERATION CENTER</span>
                <h1>{title}</h1>
                <p>Kelola konten, pemain, quest, edukasi, dan keamanan EcoQuest dari satu console.</p>
              </div>
              <Link href="/dashboard" className="admin-preview-link">
                <PixelIcon type="rpg" className="is-tiny" />
                Player View
              </Link>
            </div>
            {children}
          </main>
        </div>
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
