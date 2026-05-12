import { DEFAULT_QUESTS } from "@/domain/quests";
import { DEFAULT_ARTICLES } from "@/domain/articles";

function toMillis(value) {
  return value?.toMillis?.() || null;
}

function serializeUser(doc, rank = null) {
  const data = doc.data();
  return {
    id: doc.id,
    uid: data.uid || doc.id,
    displayName: data.displayName || "EcoWarrior",
    email: data.email || "",
    role: data.role || "user",
    level: data.level || 1,
    title: data.title || "Pemula Hijau",
    totalEcoPoints: data.totalEcoPoints || 0,
    trashCollected: data.trashCollected || 0,
    articlesRead: data.articlesRead || 0,
    npcTalks: data.npcTalks || 0,
    suspiciousScore: data.suspiciousScore || 0,
    rank,
    lastActive: toMillis(data.lastActive),
    joinedAt: toMillis(data.joinedAt || data.createdAt),
  };
}

export async function getAdminSummary(db) {
  const usersSnap = await db.collection("users").limit(200).get();
  const users = usersSnap.docs.map((doc) => serializeUser(doc));
  const sorted = [...users].sort((a, b) => b.totalEcoPoints - a.totalEcoPoints);

  return {
    totalUsers: users.length,
    totalEcoPoints: users.reduce((sum, user) => sum + user.totalEcoPoints, 0),
    totalTrashCollected: users.reduce((sum, user) => sum + user.trashCollected, 0),
    totalArticlesRead: users.reduce((sum, user) => sum + user.articlesRead, 0),
    suspiciousUsers: users.filter((user) => user.suspiciousScore > 0).length,
    topUsers: sorted.slice(0, 5).map((user, index) => ({ ...user, rank: index + 1 })),
    questCount: DEFAULT_QUESTS.length,
    articleCount: DEFAULT_ARTICLES.length,
  };
}

export async function listUsers(db) {
  const snap = await db.collection("users").orderBy("totalEcoPoints", "desc").limit(100).get();
  return snap.docs.map((doc, index) => serializeUser(doc, index + 1));
}

export async function listSuspiciousUsers(db) {
  const snap = await db.collection("users").orderBy("suspiciousScore", "desc").limit(50).get();
  return snap.docs
    .map((doc, index) => serializeUser(doc, index + 1))
    .filter((user) => user.suspiciousScore > 0);
}

export function listQuestCatalog() {
  return DEFAULT_QUESTS;
}

export function listArticleCatalog() {
  return DEFAULT_ARTICLES;
}
