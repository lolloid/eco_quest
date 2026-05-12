"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getClientAuthToken } from "@/lib/demoAuth";
import toast from "react-hot-toast";
import PixelIcon from "@/components/ui/PixelIcon";

const QUEST_ICONS = {
  game: "quest",
  education: "book",
  npc: "warrior",
  area: "tree",
  tree: "tree",
  quest: "quest",
};

const QUEST_TYPE_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  event: "Event",
  main: "Main",
  side: "Side",
};

function getObjectiveTotals(mission) {
  const objectiveValues = Object.values(mission.progress?.objectives || {});
  const current = objectiveValues.reduce((sum, objective) => sum + (objective.current || 0), 0);
  const target = objectiveValues.reduce((sum, objective) => sum + (objective.target || 0), 0);
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;
  return { current, target, percent };
}

function getRarity(mission) {
  return mission.rarity || (mission.difficulty === "hard" ? "epic" : mission.difficulty === "medium" ? "rare" : "common");
}

export default function DailyMission({ userId, profile, onComplete }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getToken = async () => {
    return getClientAuthToken(profile?.isDemo ? { ...profile, isDemo: true } : auth.currentUser);
  };

  const loadMissions = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/quests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load quests");

      const data = await res.json();
      setMissions(data.quests || []);
    } catch (err) {
      console.error("Error loading quests:", err);
      toast.error("Gagal memuat quest.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (mission) => {
    if (mission.progress?.status !== "completed") return;
    setClaiming(mission.id);

    try {
      const token = await getToken();
      const res = await fetch("/api/quests/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questId: mission.id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.reason || data.error || "Claim failed");
      }

      toast.success(`Quest complete! +${data.reward?.ecoPoints || 0} EP`);
      await loadMissions();
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Error claiming quest:", err);
      toast.error("Quest belum bisa diklaim.");
    } finally {
      setClaiming(null);
    }
  };

  const typeOptions = ["all", ...new Set(missions.map((mission) => mission.type || "daily"))];
  const filteredMissions = missions.filter((mission) => typeFilter === "all" || mission.type === typeFilter);
  const totalReward = missions.reduce((sum, mission) => sum + (mission.reward?.ecoPoints || 0), 0);
  const completedCount = missions.filter((mission) => ["completed", "claimed"].includes(mission.progress?.status)).length;
  const progressPercent = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="quest-terminal">
        <div className="quest-terminal-header">
          <div>
            <span>QUEST NETWORK</span>
            <h3>Syncing missions...</h3>
          </div>
        </div>
        <div className="quest-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="quest-rpg-card is-loading" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quest-terminal">
      <div className="quest-terminal-header">
        <div>
          <span>QUEST NETWORK</span>
          <h3>Eco Mission Board</h3>
          <p>
            {completedCount}/{missions.length} quest clear | reward pool {totalReward} EP | chain: Pickup {"->"} Recycle {"->"} Restore
          </p>
        </div>
        <div className="quest-progress-core">
          <strong>{progressPercent}%</strong>
          <div className="quest-progress-bar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="quest-filter-row">
        {typeOptions.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={typeFilter === type ? "is-active" : ""}
          >
            {type === "all" ? "All" : QUEST_TYPE_LABELS[type] || type}
          </button>
        ))}
      </div>

      <div className="quest-grid">
        {filteredMissions.map((mission, index) => {
          const status = mission.progress?.status || "active";
          const isClaimed = status === "claimed";
          const isCompleted = status === "completed" || isClaimed;
          const isClaiming = claiming === mission.id;
          const totals = getObjectiveTotals(mission);
          const rarity = getRarity(mission);

          return (
            <article
              key={mission.id}
              className={`quest-rpg-card is-${rarity} ${isCompleted ? "is-complete" : ""} ${isClaimed ? "is-claimed" : ""}`}
              style={{ animationDelay: `${index * 0.035}s` }}
            >
              <div className="quest-rpg-top">
                <div className="quest-rpg-icon">
                  <PixelIcon type={isClaimed ? "badge" : QUEST_ICONS[mission.icon] || "mission"} className="is-large" />
                </div>
                <div className="quest-rpg-tags">
                  <span>{QUEST_TYPE_LABELS[mission.type] || mission.type || "Quest"}</span>
                  <b>{rarity}</b>
                </div>
              </div>

              <h4>{mission.title}</h4>
              <p>{mission.description}</p>

              <div className="quest-rpg-objectives">
                {(mission.objectives || []).map((objective) => {
                  const progress = mission.progress?.objectives?.[objective.id] || { current: 0, target: objective.target };
                  return (
                    <div key={objective.id}>
                      <span>{objective.id.replaceAll("_", " ")}</span>
                      <b>{progress.current || 0}/{progress.target || objective.target}</b>
                    </div>
                  );
                })}
              </div>

              <div className="quest-progress-bar">
                <span style={{ width: `${totals.percent}%` }} />
              </div>

              <div className="quest-rpg-footer">
                <div>
                  <span>+{mission.reward?.xp || 0} XP</span>
                  <span>+{mission.reward?.ecoPoints || 0} EP</span>
                </div>
                {status === "completed" && (
                  <button type="button" onClick={() => handleClaim(mission)} disabled={isClaiming}>
                    {isClaiming ? "..." : "Claim"}
                  </button>
                )}
                {status === "active" && <small>Active</small>}
                {isClaimed && <small>Claimed</small>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
