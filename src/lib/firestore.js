import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  increment,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Create a new user profile in Firestore after registration.
 */
export async function createUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    displayName: data.displayName || "EcoWarrior",
    email: data.email,
    role: "user",
    totalEcoPoints: 0,
    currentXP: 0,
    level: 1,
    title: "Pemula Hijau",
    completedQuests: [],
    badges: [],
    trashCollected: 0,
    joinedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
}

/**
 * Get a user profile by UID.
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

/**
 * Update user's eco points and XP.
 */
export async function addEcoPoints(uid, points) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    totalEcoPoints: increment(points),
    currentXP: increment(points),
    lastActive: serverTimestamp(),
  });
}

/**
 * Update user's trash collected count.
 */
export async function incrementTrashCollected(uid, count = 1) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    trashCollected: increment(count),
    lastActive: serverTimestamp(),
  });
}

/**
 * Level up a user.
 */
export async function levelUpUser(uid, newLevel, newTitle) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    level: newLevel,
    title: newTitle,
    currentXP: 0,
    lastActive: serverTimestamp(),
  });
}

/**
 * Add a badge to the user.
 */
export async function addBadge(uid, badge) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    badges: arrayUnion(badge),
  });
}

// ============================================
// QUEST / DAILY MISSION OPERATIONS
// ============================================

/**
 * Get all daily missions.
 */
export async function getDailyMissions() {
  const q = query(collection(db, "dailyMissions"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get user's quest progress for today.
 */
export async function getUserQuestProgress(uid) {
  const today = new Date().toISOString().split("T")[0];
  const progressRef = doc(db, "users", uid, "questProgress", today);
  const snap = await getDoc(progressRef);
  if (snap.exists()) {
    return snap.data();
  }
  return { completedMissions: [], date: today };
}

/**
 * Mark a quest/mission as completed for a user.
 */
export async function completeQuest(uid, missionId, reward) {
  const today = new Date().toISOString().split("T")[0];
  const progressRef = doc(db, "users", uid, "questProgress", today);

  // Get current progress
  const snap = await getDoc(progressRef);
  if (snap.exists()) {
    await updateDoc(progressRef, {
      completedMissions: arrayUnion(missionId),
    });
  } else {
    await setDoc(progressRef, {
      completedMissions: [missionId],
      date: today,
    });
  }

  // Add reward points
  await addEcoPoints(uid, reward);

  // Mark quest in user's completed list
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    completedQuests: arrayUnion(`${missionId}_${today}`),
  });
}

// ============================================
// LEADERBOARD OPERATIONS
// ============================================

/**
 * Get top 10 users by totalEcoPoints.
 */
export async function getLeaderboard() {
  const q = query(
    collection(db, "users"),
    orderBy("totalEcoPoints", "desc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, index) => ({
    rank: index + 1,
    id: d.id,
    ...d.data(),
  }));
}

// ============================================
// EDUCATION ARTICLES
// ============================================

/**
 * Get all education articles.
 */
export async function getArticles() {
  const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
