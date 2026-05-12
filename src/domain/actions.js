export const ACTIONS = {
  COLLECT_TRASH: "COLLECT_TRASH",
  AREA_CLEANED: "AREA_CLEANED",
  TALK_NPC: "TALK_NPC",
  READ_ARTICLE: "READ_ARTICLE",
  COMPLETE_QUIZ: "COMPLETE_QUIZ",
};

export const TRASH_TYPES = {
  PLASTIC: "plastic",
  PAPER: "paper",
  METAL: "metal",
  GLASS: "glass",
  ORGANIC: "organic",
  ELECTRONIC: "electronic",
};

export const ACTION_RULES = {
  [ACTIONS.COLLECT_TRASH]: {
    ecoPoints: 10,
    xp: 10,
    cooldownMs: 800,
    dailyLimit: 500,
    inventory: true,
  },
  [ACTIONS.AREA_CLEANED]: {
    ecoPoints: 200,
    xp: 200,
    cooldownMs: 300000,
    dailyLimit: 10,
  },
  [ACTIONS.TALK_NPC]: {
    ecoPoints: 2,
    xp: 2,
    cooldownMs: 10000,
    dailyLimit: 60,
  },
  [ACTIONS.READ_ARTICLE]: {
    ecoPoints: 15,
    xp: 15,
    cooldownMs: 60000,
    dailyLimit: 20,
  },
  [ACTIONS.COMPLETE_QUIZ]: {
    ecoPoints: 30,
    xp: 30,
    cooldownMs: 30000,
    dailyLimit: 20,
  },
};

export function isKnownAction(action) {
  return Object.prototype.hasOwnProperty.call(ACTION_RULES, action);
}

export function normalizeTrashType(trashType) {
  const value = String(trashType || "").toLowerCase();
  return Object.values(TRASH_TYPES).includes(value) ? value : TRASH_TYPES.PLASTIC;
}
