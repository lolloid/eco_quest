// ============================================
// GAME LOGIC: Level, XP, Reward Calculations
// ============================================

/**
 * Level thresholds: XP needed to reach each level.
 * Level 1 → 2: 100 XP
 * Level 2 → 3: 250 XP
 * Level 3 → 4: 500 XP
 * etc.
 */
const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: "Pemula Hijau" },
  { level: 2, xpRequired: 100, title: "Penjaga Alam" },
  { level: 3, xpRequired: 250, title: "Pahlawan Bumi" },
  { level: 4, xpRequired: 500, title: "Eco Warrior" },
  { level: 5, xpRequired: 1000, title: "Guardian of Nature" },
  { level: 6, xpRequired: 1800, title: "Eco Champion" },
  { level: 7, xpRequired: 3000, title: "Earth Defender" },
  { level: 8, xpRequired: 5000, title: "Planet Protector" },
  { level: 9, xpRequired: 8000, title: "Eco Legend" },
  { level: 10, xpRequired: 12000, title: "Master of Gaia" },
];

/**
 * Get the XP required for the next level.
 */
export function getXPForNextLevel(currentLevel) {
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);
  if (!nextLevel) return Infinity; // Max level
  const currentThreshold = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel);
  return nextLevel.xpRequired - (currentThreshold?.xpRequired || 0);
}

/**
 * Check if user should level up.
 * Returns { shouldLevelUp, newLevel, newTitle } or null.
 */
export function checkLevelUp(currentLevel, currentXP) {
  const xpNeeded = getXPForNextLevel(currentLevel);
  if (currentXP >= xpNeeded) {
    const nextLevelData = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);
    if (nextLevelData) {
      return {
        shouldLevelUp: true,
        newLevel: nextLevelData.level,
        newTitle: nextLevelData.title,
        remainingXP: currentXP - xpNeeded,
      };
    }
  }
  return { shouldLevelUp: false };
}

/**
 * Calculate the XP progress percentage for the current level.
 */
export function getXPProgressPercent(currentLevel, currentXP) {
  const xpNeeded = getXPForNextLevel(currentLevel);
  if (xpNeeded === Infinity) return 100;
  return Math.min(Math.round((currentXP / xpNeeded) * 100), 100);
}

/**
 * Get the title for a given level.
 */
export function getTitleForLevel(level) {
  const data = LEVEL_THRESHOLDS.find((l) => l.level === level);
  return data ? data.title : "Unknown";
}

/**
 * Get all level thresholds.
 */
export function getAllLevels() {
  return LEVEL_THRESHOLDS;
}

/**
 * Calculate reward based on action type.
 */
export function calculateReward(actionType) {
  const rewards = {
    TRASH_COLLECT: 10,
    QUEST_COMPLETE: 50,
    DAILY_LOGIN: 20,
    NPC_TALK: 5,
    ARTICLE_READ: 15,
    BADGE_EARN: 100,
    GAME_COMPLETE: 200,
  };
  return rewards[actionType] || 0;
}

/**
 * Get badge criteria based on stats.
 */
export function checkBadgeEligibility(userStats) {
  const eligibleBadges = [];

  if (userStats.trashCollected >= 10 && !userStats.badges?.includes("collector_bronze")) {
    eligibleBadges.push({
      id: "collector_bronze",
      name: "🥉 Kolektor Pemula",
      description: "Kumpulkan 10 sampah",
    });
  }

  if (userStats.trashCollected >= 50 && !userStats.badges?.includes("collector_silver")) {
    eligibleBadges.push({
      id: "collector_silver",
      name: "🥈 Kolektor Handal",
      description: "Kumpulkan 50 sampah",
    });
  }

  if (userStats.trashCollected >= 100 && !userStats.badges?.includes("collector_gold")) {
    eligibleBadges.push({
      id: "collector_gold",
      name: "🥇 Kolektor Master",
      description: "Kumpulkan 100 sampah",
    });
  }

  if (userStats.level >= 5 && !userStats.badges?.includes("level_5")) {
    eligibleBadges.push({
      id: "level_5",
      name: "⭐ Level 5 Achiever",
      description: "Mencapai Level 5",
    });
  }

  if (userStats.totalEcoPoints >= 1000 && !userStats.badges?.includes("eco_1000")) {
    eligibleBadges.push({
      id: "eco_1000",
      name: "🌍 Eco Millionaire",
      description: "Kumpulkan 1000 EcoPoints",
    });
  }

  return eligibleBadges;
}
