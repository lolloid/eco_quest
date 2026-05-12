"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../layout";
import DashboardStats from "@/components/DashboardStats";
import DailyMission from "@/components/DailyMission";
import Leaderboard from "@/components/Leaderboard";
import EcoAssistant from "@/components/EcoAssistant";
import PixelIcon from "@/components/ui/PixelIcon";
import Link from "next/link";

const tabs = [
  { id: "overview", label: "Overview", icon: "earth" },
  { id: "missions", label: "Daily Missions", icon: "mission" },
  { id: "leaderboard", label: "Leaderboard", icon: "trophy" },
  { id: "assistant", label: "AI Assistant", icon: "ai" },
];

export default function DashboardPage() {
  const authContext = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authContext?.loading && !authContext?.user) {
      router.push("/login");
    }
  }, [authContext?.user, authContext?.loading, router]);

  useEffect(() => {
    const applyRouteTab = () => {
      if (typeof window === "undefined") return;
      const hashTab = window.location.hash.replace("#", "");
      const queryTab = new URLSearchParams(window.location.search).get("tab");
      const nextTab = hashTab || queryTab;
      const aliases = {
        overview: "overview",
        dashboard: "overview",
        quests: "missions",
        missions: "missions",
        leaderboard: "leaderboard",
        assistant: "assistant",
        ai: "assistant",
      };

      if (aliases[nextTab]) {
        setActiveTab(aliases[nextTab]);
      }
    };

    applyRouteTab();
    window.addEventListener("hashchange", applyRouteTab);
    window.addEventListener("popstate", applyRouteTab);
    return () => {
      window.removeEventListener("hashchange", applyRouteTab);
      window.removeEventListener("popstate", applyRouteTab);
    };
  }, []);

  if (authContext?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <PixelIcon type="leaf" className="is-large" />
          </div>
          <p className="font-pixel text-sm text-eco-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authContext?.user) return null;

  const { profile, refreshProfile } = authContext;

  return (
    <div className="dashboard-command-shell min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <div className="dashboard-ambient-grid" aria-hidden="true" />
      <div className="dashboard-command-header flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-pixel text-lg sm:text-xl text-eco-400 mb-1">DASHBOARD</h1>
          <p className="text-gray-500 text-sm">
            Selamat datang kembali,{" "}
            <span className="text-eco-400 font-semibold">{profile?.displayName || "EcoWarrior"}</span>.
          </p>
          <div className="dashboard-mini-tracker">
            <span>WORLD STATUS: STABIL</span>
            <span>DAILY QUEST: 2/4</span>
            <span>RANK: {profile?.title || "EcoWarrior"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/game" className="btn-eco text-sm inline-flex items-center gap-2">
            <PixelIcon type="rpg" className="is-nav" />
            Main Game
          </Link>
        </div>
      </div>

      <div className="dashboard-tab-console flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dashboard-command-tab flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "is-active bg-eco-500/20 text-eco-400 border border-eco-500/30"
                : "text-gray-500 hover:text-gray-300 border border-transparent"
            }`}
          >
            <PixelIcon type={tab.icon} className="is-nav" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <DashboardStats profile={profile} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/game" className="glass-card p-6 hover:border-eco-500/50 transition-all duration-300 group text-center">
                <div className="mb-3 flex justify-center transition-transform group-hover:scale-110">
                  <PixelIcon type="rpg" className="is-large" />
                </div>
                <h3 className="text-white font-semibold mb-1">Main Game</h3>
                <p className="text-gray-500 text-xs">Jelajahi kota dan kumpulkan sampah</p>
              </Link>
              <Link href="/education" className="glass-card p-6 hover:border-eco-500/50 transition-all duration-300 group text-center">
                <div className="mb-3 flex justify-center transition-transform group-hover:scale-110">
                  <PixelIcon type="book" className="is-large" />
                </div>
                <h3 className="text-white font-semibold mb-1">Education Hub</h3>
                <p className="text-gray-500 text-xs">Belajar tentang lingkungan</p>
              </Link>
              <button
                onClick={() => setActiveTab("assistant")}
                className="glass-card p-6 hover:border-eco-500/50 transition-all duration-300 group text-center cursor-pointer"
              >
                <div className="mb-3 flex justify-center transition-transform group-hover:scale-110">
                  <PixelIcon type="ai" className="is-large" />
                </div>
                <h3 className="text-white font-semibold mb-1">AI Assistant</h3>
                <p className="text-gray-500 text-xs">Tanya tips lingkungan ke AI</p>
              </button>
            </div>

            {profile?.badges?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-pixel text-sm text-eco-400 mb-4 flex items-center gap-2">
                  <PixelIcon type="badge" className="is-nav" />
                  BADGES
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.badges.map((badge, i) => (
                    <span key={i} className="badge-eco text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "missions" && (
          <DailyMission
            userId={authContext.user.uid}
            profile={profile}
            onComplete={refreshProfile}
          />
        )}

        {activeTab === "leaderboard" && <Leaderboard currentUserId={authContext.user.uid} />}

        {activeTab === "assistant" && <EcoAssistant profile={profile} />}
      </div>
    </div>
  );
}
