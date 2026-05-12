import { ACTIONS } from "./actions";

export const QUEST_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CLAIMED: "claimed",
};

export const DEFAULT_QUESTS = [
  {
    id: "daily_collect_5_trash",
    type: "daily",
    title: "Kumpulkan 5 Sampah",
    description: "Bersihkan kota virtual dengan mengumpulkan 5 sampah.",
    difficulty: "easy",
    icon: "game",
    objectives: [
      {
        id: "collect_trash",
        action: ACTIONS.COLLECT_TRASH,
        target: 5,
      },
    ],
    reward: { ecoPoints: 50, xp: 50 },
    order: 1,
    isActive: true,
  },
  {
    id: "daily_collect_12_trash",
    type: "daily",
    title: "Clean Sweep Patrol",
    description: "Kumpulkan 12 item sampah dari area kota dan taman.",
    difficulty: "medium",
    rarity: "rare",
    icon: "game",
    objectives: [{ id: "collect_trash_12", action: ACTIONS.COLLECT_TRASH, target: 12 }],
    reward: { ecoPoints: 90, xp: 90 },
    order: 2,
    isActive: true,
  },
  {
    id: "daily_read_article",
    type: "daily",
    title: "Baca 1 Artikel Edukasi",
    description: "Baca artikel sampai selesai di Education Hub.",
    difficulty: "easy",
    icon: "education",
    objectives: [
      {
        id: "read_article",
        action: ACTIONS.READ_ARTICLE,
        target: 1,
      },
    ],
    reward: { ecoPoints: 30, xp: 30 },
    order: 3,
    isActive: true,
  },
  {
    id: "daily_quiz_runner",
    type: "daily",
    title: "Knowledge Check",
    description: "Selesaikan 1 quiz edukasi di Education Hub.",
    difficulty: "medium",
    rarity: "rare",
    icon: "education",
    objectives: [{ id: "complete_quiz", action: ACTIONS.COMPLETE_QUIZ, target: 1 }],
    reward: { ecoPoints: 60, xp: 60 },
    order: 4,
    isActive: true,
  },
  {
    id: "daily_talk_npc",
    type: "daily",
    title: "Bicara dengan NPC",
    description: "Temui NPC di Eco World untuk mendapatkan edukasi singkat.",
    difficulty: "easy",
    icon: "npc",
    objectives: [
      {
        id: "talk_npc",
        action: ACTIONS.TALK_NPC,
        target: 1,
      },
    ],
    reward: { ecoPoints: 25, xp: 25 },
    order: 5,
    isActive: true,
  },
  {
    id: "daily_npc_network",
    type: "daily",
    title: "Eco Town Check-in",
    description: "Bicara dengan 3 NPC untuk membuka petunjuk misi hari ini.",
    difficulty: "easy",
    rarity: "common",
    icon: "npc",
    objectives: [{ id: "talk_3_npc", action: ACTIONS.TALK_NPC, target: 3 }],
    reward: { ecoPoints: 40, xp: 40 },
    order: 6,
    isActive: true,
  },
  {
    id: "daily_clean_area",
    type: "daily",
    title: "Bersihkan Area Starter",
    description: "Kumpulkan semua sampah di area starter park.",
    difficulty: "medium",
    icon: "area",
    objectives: [
      {
        id: "clean_area",
        action: ACTIONS.AREA_CLEANED,
        target: 1,
        filters: { areaId: "starter_park" },
      },
    ],
    reward: { ecoPoints: 75, xp: 75 },
    order: 7,
    isActive: true,
  },
  {
    id: "weekly_restore_river",
    type: "weekly",
    title: "Restore Polluted River",
    description: "Selesaikan 3 aksi bersih area untuk memulihkan sungai.",
    difficulty: "hard",
    rarity: "epic",
    icon: "area",
    objectives: [{ id: "clean_area_3", action: ACTIONS.AREA_CLEANED, target: 3 }],
    reward: { ecoPoints: 220, xp: 220 },
    order: 8,
    isActive: true,
  },
  {
    id: "weekly_eco_scholar",
    type: "weekly",
    title: "Eco Scholar Chain",
    description: "Baca 5 artikel untuk menaikkan knowledge rank.",
    difficulty: "medium",
    rarity: "rare",
    icon: "education",
    objectives: [{ id: "read_5_articles", action: ACTIONS.READ_ARTICLE, target: 5 }],
    reward: { ecoPoints: 160, xp: 160 },
    order: 9,
    isActive: true,
  },
  {
    id: "event_climate_action",
    type: "event",
    title: "Climate Action Signal",
    description: "Gabungkan edukasi dan aksi: baca artikel climate lalu bersihkan area.",
    difficulty: "hard",
    rarity: "epic",
    icon: "tree",
    objectives: [
      { id: "read_climate", action: ACTIONS.READ_ARTICLE, target: 1, filters: { articleCategory: "Climate" } },
      { id: "clean_area", action: ACTIONS.AREA_CLEANED, target: 1 },
    ],
    reward: { ecoPoints: 180, xp: 180 },
    order: 10,
    isActive: true,
  },
  {
    id: "chain_pickup_recycle_restore",
    type: "event",
    title: "Pickup -> Recycle -> Restore",
    description: "Quest chain utama: kumpulkan sampah, belajar recycle, lalu pulihkan area.",
    difficulty: "medium",
    rarity: "epic",
    icon: "quest",
    objectives: [
      { id: "pickup_trash", action: ACTIONS.COLLECT_TRASH, target: 8 },
      { id: "learn_recycle", action: ACTIONS.READ_ARTICLE, target: 1, filters: { articleCategory: "Daur Ulang" } },
      { id: "restore_area", action: ACTIONS.AREA_CLEANED, target: 1 },
    ],
    reward: { ecoPoints: 200, xp: 200 },
    order: 11,
    isActive: true,
  },
];

export function getQuestCycleKey(quest, date = new Date()) {
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  const localDate = new Date(date.getTime() + jakartaOffsetMs);
  const dayKey = localDate.toISOString().slice(0, 10);

  if (quest.type === "weekly") {
    const firstDay = new Date(Date.UTC(localDate.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((localDate - firstDay) / 86400000) + 1;
    const week = Math.ceil(dayOfYear / 7);
    return `${localDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  return quest.type === "daily" ? dayKey : "permanent";
}

export function objectiveMatchesEvent(objective, action, metadata = {}) {
  if (objective.action !== action) return false;

  const filters = objective.filters || {};
  return Object.entries(filters).every(([key, value]) => metadata[key] === value);
}
