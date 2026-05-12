"use client";

import { getXPProgressPercent, getXPForNextLevel, getTitleForLevel } from "@/lib/gameLogic";
import PixelIcon from "@/components/ui/PixelIcon";

export default function DashboardStats({ profile }) {
  if (!profile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-4 bg-pixel-border rounded w-1/2 mb-3" />
            <div className="h-8 bg-pixel-border rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const xpPercent = getXPProgressPercent(profile.level, profile.currentXP);
  const xpNeeded = getXPForNextLevel(profile.level);
  const title = getTitleForLevel(profile.level);

  const stats = [
    {
      icon: "level",
      label: "Level",
      value: profile.level,
      subtitle: title,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
    },
    {
      icon: "eco",
      label: "EcoPoints",
      value: profile.totalEcoPoints?.toLocaleString() || "0",
      subtitle: "Total poin terkumpul",
      color: "text-eco-400",
      bgColor: "bg-eco-400/10",
      borderColor: "border-eco-400/20",
    },
    {
      icon: "trash",
      label: "Sampah Dikumpulkan",
      value: profile.trashCollected?.toLocaleString() || "0",
      subtitle: "Di dalam game",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20",
    },
    {
      icon: "badge",
      label: "Badges",
      value: profile.badges?.length || 0,
      subtitle: "Badge diraih",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stat-card ${stat.borderColor} border animate-slide-up`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <PixelIcon type={stat.icon} className="is-large" />
              <span className={`${stat.bgColor} ${stat.color} px-2 py-1 rounded-lg text-xs font-medium`}>
                {stat.label}
              </span>
            </div>
            <p className={`font-pixel text-2xl ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3 gap-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Level Progress</h3>
            <p className="text-gray-500 text-xs">
              {profile.currentXP || 0} / {xpNeeded === Infinity ? "MAX" : xpNeeded} XP
            </p>
          </div>
          <div className="text-right">
            <span className="badge-eco">Level {profile.level}</span>
            {profile.level < 10 && (
              <p className="text-gray-500 text-xs mt-1">
                Next Level {profile.level + 1}: {getTitleForLevel(profile.level + 1)}
              </p>
            )}
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{xpPercent}%</p>
      </div>
    </div>
  );
}
