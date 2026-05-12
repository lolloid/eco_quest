"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/firestore";
import PixelIcon from "@/components/ui/PixelIcon";

export default function Leaderboard({ currentUserId }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard();
      setLeaders(data);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setLeaders([
        { rank: 1, displayName: "EcoMaster99", totalEcoPoints: 12500, level: 8, title: "Planet Protector" },
        { rank: 2, displayName: "GreenHero", totalEcoPoints: 9800, level: 7, title: "Earth Defender" },
        { rank: 3, displayName: "NatureGuard", totalEcoPoints: 7200, level: 6, title: "Eco Champion" },
        { rank: 4, displayName: "EcoWarrior", totalEcoPoints: 5100, level: 5, title: "Guardian of Nature" },
        { rank: 5, displayName: "TreePlanter", totalEcoPoints: 3400, level: 4, title: "Eco Warrior" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return { icon: "trophy", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
      case 2:
        return { icon: "rank", bg: "bg-gray-400/10", border: "border-gray-400/30", text: "text-gray-300" };
      case 3:
        return { icon: "badge", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" };
      default:
        return { icon: "rank", bg: "bg-pixel-darker", border: "border-pixel-border", text: "text-gray-400" };
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-pixel-border" />
              <div className="flex-1">
                <div className="h-4 bg-pixel-border rounded w-1/3 mb-2" />
                <div className="h-3 bg-pixel-border rounded w-1/4" />
              </div>
              <div className="h-6 bg-pixel-border rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-2 gap-3">
          <h3 className="font-pixel text-sm text-eco-400 flex items-center gap-2">
            <PixelIcon type="trophy" className="is-nav" />
            LEADERBOARD
          </h3>
          <button
            onClick={loadLeaderboard}
            className="text-gray-500 hover:text-eco-400 transition-colors text-xs"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-500 text-xs">Top 10 EcoWarriors dengan EcoPoints tertinggi</p>
      </div>

      {leaders.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
            const podiumOrder = [2, 1, 3];
            const rank = podiumOrder[i];
            const style = getRankStyle(rank);
            const heights = ["h-28", "h-36", "h-24"];
            const isCurrentUser = leader?.id === currentUserId;

            return (
              <div key={rank} className="flex flex-col items-center justify-end">
                <div className="text-center mb-3">
                  <div className="flex justify-center">
                    <PixelIcon type={style.icon} className="is-nav" />
                  </div>
                  <p className={`text-xs font-semibold mt-2 ${isCurrentUser ? "text-eco-400" : "text-white"} truncate max-w-[100px]`}>
                    {leader?.displayName || "???"}
                  </p>
                  <p className="text-xs text-gray-500">{leader?.totalEcoPoints?.toLocaleString()} EP</p>
                </div>
                <div
                  className={`w-full ${heights[i]} ${style.bg} border ${style.border} rounded-t-xl flex items-center justify-center`}
                >
                  <span className="font-pixel text-lg text-white">{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-card p-4 space-y-2">
        {leaders.map((leader, i) => {
          const style = getRankStyle(leader.rank);
          const isCurrentUser = leader.id === currentUserId;

          return (
            <div
              key={leader.id || i}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 animate-slide-up ${
                isCurrentUser
                  ? "bg-eco-500/10 border border-eco-500/30"
                  : "hover:bg-pixel-darker/50"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`w-10 h-10 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}
              >
                {leader.rank <= 3 ? (
                  <PixelIcon type={style.icon} className="is-nav" />
                ) : (
                  <span className={`text-sm font-bold ${style.text}`}>{leader.rank}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isCurrentUser ? "text-eco-400" : "text-white"}`}>
                  {leader.displayName}
                  {isCurrentUser && " (Kamu)"}
                </p>
                <p className="text-gray-500 text-xs">
                  Lv.{leader.level} - {leader.title}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-pixel text-sm text-eco-400">
                  {leader.totalEcoPoints?.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs">EP</p>
              </div>
            </div>
          );
        })}

        {leaders.length === 0 && (
          <div className="text-center py-10">
            <div className="mb-3 flex justify-center">
              <PixelIcon type="trophy" className="is-large" />
            </div>
            <p className="text-gray-500 text-sm">Belum ada data leaderboard.</p>
            <p className="text-gray-600 text-xs mt-1">Main game dan kumpulkan EcoPoints!</p>
          </div>
        )}
      </div>
    </div>
  );
}
