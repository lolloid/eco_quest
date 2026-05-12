export const DEMO_USER_ID = "demo-user";
export const DEMO_TOKEN = "ecoquest-demo-token";
export const DEMO_STORAGE_KEY = "ecoquest_demo_auth";

export const DEMO_PROFILE = {
  uid: DEMO_USER_ID,
  id: DEMO_USER_ID,
  displayName: "Demo EcoWarrior",
  email: "demo@ecoquest.local",
  totalEcoPoints: 1250,
  currentXP: 80,
  level: 5,
  title: "Guardian of Nature",
  completedQuests: [],
  badges: ["Starter Cleaner", "Recycle Scout"],
  trashCollected: 22,
  articlesRead: 3,
  npcTalks: 6,
  role: "user",
  isDemo: true,
};

export const DEMO_USER = {
  uid: DEMO_USER_ID,
  email: DEMO_PROFILE.email,
  displayName: DEMO_PROFILE.displayName,
  isAnonymous: false,
  isDemo: true,
  getIdToken: async () => DEMO_TOKEN,
};

export function isDemoAuthEnabled() {
  return process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DISABLE_DEMO_AUTH !== "true";
}

export function isDemoToken(token) {
  return isDemoAuthEnabled() && token === DEMO_TOKEN;
}

export function isDemoUser(user) {
  return Boolean(user?.isDemo || user?.uid === DEMO_USER_ID);
}

export async function getClientAuthToken(user) {
  if (isDemoUser(user)) return DEMO_TOKEN;

  const token = await user?.getIdToken?.();
  if (!token) throw new Error("Missing auth token");
  return token;
}
