export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Pemula Hijau" },
  { level: 2, xp: 100, title: "Penjaga Alam" },
  { level: 3, xp: 250, title: "Pahlawan Bumi" },
  { level: 4, xp: 500, title: "Eco Warrior" },
  { level: 5, xp: 1000, title: "Guardian of Nature" },
  { level: 6, xp: 1800, title: "Eco Champion" },
  { level: 7, xp: 3000, title: "Earth Defender" },
  { level: 8, xp: 5000, title: "Planet Protector" },
  { level: 9, xp: 8000, title: "Eco Legend" },
  { level: 10, xp: 12000, title: "Master of Gaia" },
];

export function getLevelUpResult(currentLevel, currentXP) {
  const nextLevel = LEVEL_THRESHOLDS.find((item) => item.level === currentLevel + 1);
  const currentThreshold = LEVEL_THRESHOLDS.find((item) => item.level === currentLevel);

  if (!nextLevel) return null;

  const xpNeeded = nextLevel.xp - (currentThreshold?.xp || 0);
  if (currentXP < xpNeeded) return null;

  return {
    newLevel: nextLevel.level,
    newTitle: nextLevel.title,
    remainingXP: currentXP - xpNeeded,
  };
}
