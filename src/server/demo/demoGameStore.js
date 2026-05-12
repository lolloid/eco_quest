import { ACTIONS, ACTION_RULES, normalizeTrashType } from "@/domain/actions";

const INITIAL_INVENTORY = [
  { itemId: "trash_plastic", type: "trash", trashType: "plastic", rarity: "common", quantity: 2 },
  { itemId: "trash_paper", type: "trash", trashType: "paper", rarity: "common", quantity: 1 },
  { itemId: "trash_metal", type: "trash", trashType: "metal", rarity: "rare", quantity: 1 },
  { itemId: "trash_electronic", type: "trash", trashType: "electronic", rarity: "rare", quantity: 1 },
];

const INITIAL_AREAS = [
  {
    id: "taman_kota",
    name: "Taman Kota",
    requiredLevel: 1,
    cleanlinessScore: 42,
    pollutionLevel: 58,
    status: "recovering",
  },
  {
    id: "sungai",
    name: "Sungai",
    requiredLevel: 2,
    cleanlinessScore: 35,
    pollutionLevel: 65,
    status: "dirty",
  },
  {
    id: "sekolah",
    name: "Sekolah",
    requiredLevel: 1,
    cleanlinessScore: 56,
    pollutionLevel: 44,
    status: "recovering",
  },
];

const INITIAL_QUESTS = [
  {
    id: "daily_collect_plastic",
    title: "Kumpulkan 5 Sampah Plastik",
    description: "Bersihkan area dan kumpulkan sampah plastik di sekitar taman.",
    icon: "game",
    type: "daily",
    difficulty: "easy",
    reward: { ecoPoints: 75, xp: 50 },
    progress: {
      status: "active",
      objectives: {
        collectPlastic: { current: 2, target: 5 },
      },
    },
  },
  {
    id: "daily_clean_sweep",
    title: "Clean Sweep Patrol",
    description: "Kumpulkan 12 item sampah dari taman, jalan, dan sekitar recycle station.",
    icon: "game",
    type: "daily",
    difficulty: "medium",
    rarity: "rare",
    reward: { ecoPoints: 90, xp: 90 },
    progress: {
      status: "active",
      objectives: {
        collectTrash: { current: 4, target: 12 },
      },
    },
  },
  {
    id: "daily_talk_prof",
    title: "Bicara dengan Prof. Eco",
    description: "Temui Prof. Eco untuk mendapatkan arahan misi hari ini.",
    icon: "npc",
    type: "daily",
    difficulty: "easy",
    reward: { ecoPoints: 30, xp: 20 },
    progress: {
      status: "completed",
      objectives: {
        talkNpc: { current: 1, target: 1 },
      },
    },
  },
  {
    id: "daily_recycle_intro",
    title: "Recycle Station Trial",
    description: "Bawa sampah yang sudah terkumpul ke recycle station dan pelajari kategori pilah.",
    icon: "area",
    type: "daily",
    difficulty: "easy",
    rarity: "common",
    reward: { ecoPoints: 45, xp: 45 },
    progress: {
      status: "active",
      objectives: {
        recycleIntro: { current: 0, target: 1 },
      },
    },
  },
  {
    id: "daily_read_recycle",
    title: "Read: Panduan Pilah Sampah",
    description: "Buka Education Hub dan baca satu modul tentang daur ulang.",
    icon: "education",
    type: "daily",
    difficulty: "easy",
    rarity: "common",
    reward: { ecoPoints: 30, xp: 30 },
    progress: {
      status: "active",
      objectives: {
        readArticle: { current: 0, target: 1 },
      },
    },
  },
  {
    id: "daily_quiz_eco",
    title: "Knowledge Check",
    description: "Selesaikan satu quiz eco untuk menaikkan knowledge rank.",
    icon: "education",
    type: "daily",
    difficulty: "medium",
    rarity: "rare",
    reward: { ecoPoints: 60, xp: 60 },
    progress: {
      status: "active",
      objectives: {
        completeQuiz: { current: 0, target: 1 },
      },
    },
  },
  {
    id: "weekly_restore_river",
    title: "Restore Polluted River",
    description: "Pulihkan sungai dengan membersihkan area dan mengurangi sampah plastik.",
    icon: "area",
    type: "weekly",
    difficulty: "hard",
    rarity: "epic",
    reward: { ecoPoints: 220, xp: 220 },
    progress: {
      status: "active",
      objectives: {
        cleanArea: { current: 1, target: 3 },
      },
    },
  },
  {
    id: "weekly_eco_scholar",
    title: "Eco Scholar Chain",
    description: "Baca 5 modul Education Hub untuk membuka badge Eco Learner.",
    icon: "education",
    type: "weekly",
    difficulty: "medium",
    rarity: "rare",
    reward: { ecoPoints: 160, xp: 160 },
    progress: {
      status: "active",
      objectives: {
        readFive: { current: 1, target: 5 },
      },
    },
  },
  {
    id: "event_climate_signal",
    title: "Climate Action Signal",
    description: "Gabungkan edukasi climate dan aksi bersih area untuk menstabilkan Eco Town.",
    icon: "tree",
    type: "event",
    difficulty: "hard",
    rarity: "epic",
    reward: { ecoPoints: 180, xp: 180 },
    progress: {
      status: "active",
      objectives: {
        readClimate: { current: 0, target: 1 },
        cleanArea: { current: 0, target: 1 },
      },
    },
  },
  {
    id: "chain_pickup_recycle_restore",
    title: "Pickup -> Recycle -> Restore",
    description: "Quest chain utama: kumpulkan sampah, pelajari recycle, lalu pulihkan area.",
    icon: "quest",
    type: "event",
    difficulty: "medium",
    rarity: "epic",
    reward: { ecoPoints: 200, xp: 200 },
    progress: {
      status: "active",
      objectives: {
        pickupTrash: { current: 4, target: 8 },
        learnRecycle: { current: 0, target: 1 },
        restoreArea: { current: 0, target: 1 },
      },
    },
  },
];

const demoState = {
  inventory: INITIAL_INVENTORY.map((item) => ({ ...item })),
  areas: INITIAL_AREAS.map((area) => ({ ...area })),
  quests: INITIAL_QUESTS.map((quest) => structuredClone(quest)),
  score: 1250,
  lastActions: new Map(),
};

function clone(value) {
  return structuredClone(value);
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function getArea(areaId) {
  const fallback = demoState.areas[0];
  return demoState.areas.find((area) => area.id === areaId) || fallback;
}

function upsertInventory(trashType, delta) {
  const itemId = `trash_${trashType}`;
  const existing = demoState.inventory.find((item) => item.itemId === itemId);

  if (!existing && delta > 0) {
    demoState.inventory.push({
      itemId,
      type: "trash",
      trashType,
      rarity: "common",
      quantity: delta,
      updatedAt: Date.now(),
    });
    return;
  }

  if (!existing) return;
  existing.quantity = Math.max(0, (existing.quantity || 0) + delta);
  existing.updatedAt = Date.now();
  demoState.inventory = demoState.inventory.filter((item) => (item.quantity || 0) > 0);
}

function improveArea(areaId, amount) {
  const area = getArea(areaId);
  area.cleanlinessScore = clamp((area.cleanlinessScore || 0) + amount);
  area.pollutionLevel = clamp((area.pollutionLevel ?? 100) - amount);
  area.status = area.cleanlinessScore >= 100 ? "clean" : "recovering";
  area.updatedAt = Date.now();
  return clone(area);
}

function updateCollectQuest(trashType) {
  const quest = demoState.quests.find((item) => item.id === "daily_collect_plastic");
  if (!quest || trashType !== "plastic") return;

  const objective = quest.progress.objectives.collectPlastic;
  objective.current = Math.min(objective.target, objective.current + 1);
  if (objective.current >= objective.target && quest.progress.status === "active") {
    quest.progress.status = "completed";
  }
}

function withinCooldown(key, cooldownMs) {
  const now = Date.now();
  const lastAt = demoState.lastActions.get(key) || 0;
  if (now - lastAt < cooldownMs) return cooldownMs - (now - lastAt);
  demoState.lastActions.set(key, now);
  return 0;
}

export function getDemoInventory() {
  return clone(demoState.inventory);
}

export function getDemoWorld() {
  return clone(demoState.areas);
}

export function getDemoQuests() {
  return clone(demoState.quests);
}

export function claimDemoQuest(questId) {
  const quest = demoState.quests.find((item) => item.id === questId);
  if (!quest) return { success: false, reason: "QUEST_NOT_FOUND" };
  if (quest.progress?.status !== "completed") return { success: false, reason: "QUEST_NOT_COMPLETED" };

  quest.progress.status = "claimed";
  const reward = quest.reward || { ecoPoints: 0, xp: 0 };
  demoState.score += reward.ecoPoints || 0;
  return { success: true, questId, reward };
}

export function processDemoActionEvent({ action, metadata = {} }) {
  const rule = ACTION_RULES[action];
  if (!rule) return { accepted: false, reason: "UNKNOWN_ACTION" };

  const key = `${action}_${metadata.clientEventId || "manual"}`;
  const retryAfterMs = withinCooldown(key, Math.min(rule.cooldownMs || 0, 600));
  if (retryAfterMs > 0) {
    return { accepted: false, reason: "COOLDOWN", retryAfterMs };
  }

  let worldUpdate = null;
  if (action === ACTIONS.COLLECT_TRASH) {
    const trashType = normalizeTrashType(metadata.trashType);
    upsertInventory(trashType, 1);
    updateCollectQuest(trashType);
    worldUpdate = improveArea(metadata.areaId || "taman_kota", 4);
  }

  if (action === ACTIONS.TALK_NPC) {
    worldUpdate = improveArea(metadata.areaId || "taman_kota", 1);
  }

  demoState.score += rule.ecoPoints || 0;

  return {
    accepted: true,
    reward: {
      ecoPoints: rule.ecoPoints || 0,
      xp: rule.xp || 0,
    },
    levelUp: null,
    changedQuestIds: ["daily_collect_plastic"],
    unlockedAchievements: [],
    worldUpdate,
  };
}

export function recycleDemoInventoryItem({ trashType, areaId = "taman_kota" }) {
  const normalizedType = normalizeTrashType(trashType);
  const item = demoState.inventory.find(
    (entry) => entry.trashType === normalizedType && (entry.quantity || 0) > 0
  );

  if (!item) {
    return {
      success: false,
      reason: "ITEM_NOT_FOUND",
      message: "Tidak ada item untuk didaur ulang.",
    };
  }

  upsertInventory(normalizedType, -1);
  const reward = normalizedType === "glass" ? 18 : normalizedType === "metal" ? 16 : normalizedType === "organic" ? 6 : 12;
  demoState.score += reward;

  return {
    success: true,
    reward,
    trashType: normalizedType,
    areaId,
    worldUpdate: improveArea(areaId, 8),
  };
}
