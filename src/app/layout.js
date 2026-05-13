"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PixelIcon from "@/components/ui/PixelIcon";
import { clearSessionCookie } from "@/lib/authSession";
import { getXPProgressPercent } from "@/lib/gameLogic";
import toast from "react-hot-toast";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function EcoNavbar() {
  const authContext = useAuth();
  const user = authContext?.user;
  const profile = authContext?.profile;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hudMobileOpen, setHudMobileOpen] = useState(false);
  const [routeHash, setRouteHash] = useState("overview");

  useEffect(() => {
    const syncHash = () => {
      if (typeof window === "undefined") return;
      setRouteHash(window.location.hash.replace("#", "") || "overview");
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    setHudMobileOpen(false);
  }, [pathname, routeHash]);

  const dashboardHudRoutes = ["/dashboard", "/game", "/education"];
  const useDashboardHud = Boolean(user) && dashboardHudRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const dashboardActive = pathname === "/dashboard";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const handleLogout = async () => {
    try {
      authContext?.endDemoSession?.();
      await clearSessionCookie();
      if (auth.currentUser) {
        await signOut(auth);
      }
      toast.success("Logout berhasil.");
      router.replace("/");
      router.refresh();
    } catch (err) {
      toast.error("Gagal logout.");
    }
  };

  if (useDashboardHud) {
    const xpPercent = getXPProgressPercent(profile?.level || 1, profile?.currentXP || 0);
    const navItems = [
      { href: "/dashboard#overview", label: "Dashboard", icon: "dashboard", active: dashboardActive && routeHash === "overview" },
      { href: "/game", label: "Play Game", icon: "rpg", active: pathname === "/game" },
      { href: "/dashboard#missions", label: "Quests", icon: "quest", active: dashboardActive && routeHash === "missions" },
      { href: "/dashboard#leaderboard", label: "Leaderboard", icon: "trophy", active: dashboardActive && routeHash === "leaderboard" },
      { href: "/education", label: "Education", icon: "book", active: pathname === "/education" },
      { href: "/dashboard#assistant", label: "AI Assistant", icon: "robot", active: dashboardActive && routeHash === "assistant" },
    ];
    const mobileNavItems = [
      { href: "/", label: "Home", icon: "home", active: pathname === "/" },
      { href: "/dashboard#overview", label: "Dashboard", icon: "dashboard", active: dashboardActive && routeHash === "overview" },
      { href: "/game", label: "Play Game", icon: "rpg", active: pathname === "/game" },
      { href: "/dashboard#missions", label: "Daily Missions", icon: "quest", active: dashboardActive && routeHash === "missions" },
      { href: "/dashboard#leaderboard", label: "Leaderboard", icon: "trophy", active: dashboardActive && routeHash === "leaderboard" },
      { href: "/education", label: "Education Hub", icon: "book", active: pathname === "/education" },
      { href: "/dashboard#assistant", label: "AI Assistant", icon: "robot", active: dashboardActive && routeHash === "assistant" },
    ];

    return (
      <nav className={`hud-navbar ${pathname === "/game" ? "is-game-mobile" : ""}`}>
        <div className="hud-scanline" />
        <div className="hud-corner hud-corner-left" />
        <div className="hud-corner hud-corner-right" />
        <div className="hud-navbar-inner">
          <div className="hud-left">
            <Link href="/" className="hud-brand" aria-label="PixelTerra Home">
              <PixelIcon type="leaf" className="is-nav eco-logo-pixel" />
              <span>
                <strong>PixelTerra</strong>
              </span>
            </Link>
            <div className="hud-player-status">
              <span className="hud-online-dot" />
              <span>ONLINE</span>
            </div>
          </div>

          <div className="hud-game-mini-profile" aria-label="Mobile player status">
            <span>Lv.{profile?.level || 1}</span>
            <i><b style={{ width: `${xpPercent}%` }} /></i>
            <em>{xpPercent}%</em>
          </div>

          <button
            type="button"
            className={`hud-mobile-toggle ${hudMobileOpen ? "is-open" : ""}`}
            onClick={() => setHudMobileOpen((open) => !open)}
            aria-label="Buka menu dashboard"
            aria-expanded={hudMobileOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="hud-center" aria-label="Dashboard navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (item.href.startsWith("/dashboard#")) {
                    setTimeout(() => window.dispatchEvent(new Event("hashchange")), 0);
                  }
                }}
                className={`hud-tab ${item.active ? "is-active" : ""}`}
              >
                <PixelIcon type={item.icon} className="is-nav" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hud-right">
            <div className="hud-avatar-panel">
              <PixelIcon type="warrior" className="is-nav" />
              <div className="hud-avatar-meta">
                <small>Lv.{profile?.level || 1}</small>
              </div>
            </div>
            <div className="hud-xp">
              <div className="hud-xp-top">
                <span>XP</span>
                <span>{xpPercent}%</span>
              </div>
              <div className="hud-xp-bar">
                <span style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
            <div className="hud-points">
              <PixelIcon type="eco" className="is-nav" />
              <span>{(profile?.totalEcoPoints || 0).toLocaleString()}</span>
              <small>EP</small>
            </div>
            <button type="button" className="hud-logout" onClick={handleLogout}>
              <PixelIcon type="logout" className="is-tiny" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`hud-mobile-backdrop ${hudMobileOpen ? "is-open" : ""}`}
          onClick={() => setHudMobileOpen(false)}
          aria-label="Tutup menu dashboard"
          tabIndex={hudMobileOpen ? 0 : -1}
        />

        <div className={`hud-mobile-drawer ${hudMobileOpen ? "is-open" : ""}`}>
          <div className="hud-mobile-profile">
            <PixelIcon type="warrior" className="is-nav" />
            <div>
              <strong>{profile?.displayName || "EcoWarrior"}</strong>
              <span>Lv.{profile?.level || 1} | {(profile?.totalEcoPoints || 0).toLocaleString()} EP</span>
            </div>
          </div>
          <div className="hud-mobile-xp">
            <span>XP {xpPercent}%</span>
            <div><i style={{ width: `${xpPercent}%` }} /></div>
          </div>
          <div className="hud-mobile-links">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setHudMobileOpen(false);
                  if (item.href.startsWith("/dashboard#")) {
                    setTimeout(() => window.dispatchEvent(new Event("hashchange")), 0);
                  }
                }}
                className={item.active ? "is-active" : ""}
              >
                <PixelIcon type={item.icon} className="is-tiny" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button type="button" onClick={handleLogout}>
              <PixelIcon type="logout" className="is-tiny" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  if (isAdminRoute) {
    return null;
  }

  const publicNavItems = [
    { href: "/", label: "Home", icon: "home", active: pathname === "/" },
    { href: "/#about", label: "About", icon: "about", active: false },
    { href: "/login", label: "Login", icon: "key", active: pathname === "/login" },
    { href: "/register", label: "Register", icon: "scroll", active: pathname === "/register" },
  ];
  const navItems = user
    ? [
        { href: "/", label: "Home", icon: "home", active: pathname === "/" },
        { href: "/#about", label: "About", icon: "about", active: false },
        { href: "/dashboard#overview", label: "Dashboard", icon: "dashboard", active: dashboardActive && routeHash === "overview" },
        { href: "/game", label: "Play Game", icon: "rpg", active: pathname === "/game" },
      ]
    : publicNavItems;
  const publicMobileItems = publicNavItems;

  return (
    <>
      <nav className="eco-navbar">
        <div className="eco-navbar-grid" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eco-navbar-inner">
            <Link href="/" className="eco-navbar-logo" aria-label="PixelTerra Home">
              <PixelIcon type="leaf" className="is-nav eco-logo-pixel" />
              <span className="eco-logo-text">PixelTerra</span>
            </Link>

            <div className="eco-navbar-menu" aria-label="Public navigation">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`eco-navbar-link ${item.active ? "is-active" : ""}`}
                >
                  <PixelIcon type={item.icon} className="is-nav" />
                  <span>{item.label}</span>
                  {index < navItems.length - 1 && <span className="nav-separator" aria-hidden="true" />}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className={`eco-navbar-toggle ${mobileOpen ? "is-open" : ""}`}
              aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-controls="eco-public-mobile-menu"
              aria-expanded={mobileOpen}
            >
              <span className="eco-menu-lines" />
            </button>
          </div>
        </div>
      </nav>

      <button
        type="button"
        className={`eco-mobile-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-label="Tutup menu navigasi"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <div
        id="eco-public-mobile-menu"
        className={`eco-navbar-mobile ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        {publicMobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`eco-navbar-link ${item.active ? "is-active" : ""}`}
          >
            <PixelIcon type={item.icon} className="is-nav" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

function AppShell({ children }) {
  const { user } = useAuth() || {};
  const pathname = usePathname();
  const dashboardHudRoutes = ["/dashboard", "/game", "/education"];
  const useDashboardHud = Boolean(user) && dashboardHudRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isGameRoute = pathname === "/game";

  return (
    <>
      <EcoNavbar />
      <main className={`${useDashboardHud ? "dashboard-main-shell pt-[88px]" : "pt-[72px]"} ${isGameRoute ? "game-main-shell" : ""} min-h-screen`}>{children}</main>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <title>PixelTerra - Gamifikasi RPG Edukasi Lingkungan</title>
        <meta
          name="description"
          content="PixelTerra adalah platform gamifikasi RPG pixel art untuk edukasi lingkungan. Kumpulkan sampah, selesaikan misi, dan selamatkan bumi."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23020617'/%3E%3Crect x='10' y='10' width='44' height='44' fill='%2310b981'/%3E%3Crect x='18' y='18' width='28' height='28' fill='%23020617'/%3E%3Crect x='26' y='14' width='12' height='36' fill='%2367e8f9'/%3E%3C/svg%3E"
        />
      </head>
      <body className="bg-pixel-darker min-h-screen bg-grid-pattern">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: "12px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#fff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
