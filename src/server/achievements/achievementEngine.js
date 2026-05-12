import { FieldValue } from "firebase-admin/firestore";
import { DEFAULT_ACHIEVEMENTS } from "@/domain/achievements";

function getProjectedStat({ userData, action, stat }) {
  const current = userData[stat] || 0;

  if (action === "COLLECT_TRASH" && stat === "trashCollected") return current + 1;
  if (action === "READ_ARTICLE" && stat === "articlesRead") return current + 1;
  if (action === "TALK_NPC" && stat === "npcTalks") return current + 1;

  return current;
}

export async function prepareAchievementsForEvent({ tx, userRef, userData, action }) {
  const candidates = DEFAULT_ACHIEVEMENTS.filter((achievement) => achievement.action === action);
  const reads = [];

  for (const achievement of candidates) {
    const achievementRef = userRef.collection("achievements").doc(achievement.id);
    reads.push({
      achievement,
      achievementRef,
      snap: await tx.get(achievementRef),
      projectedStat: getProjectedStat({ userData, action, stat: achievement.stat }),
    });
  }

  return reads;
}

export function writeAchievementsForEvent({ tx, preparedAchievements }) {
  const unlocked = [];
  for (const item of preparedAchievements) {
    const alreadyUnlocked = item.snap.exists && item.snap.data().status === "unlocked";
    const progress = Math.min(item.projectedStat, item.achievement.target);

    if (alreadyUnlocked) {
      tx.set(
        item.achievementRef,
        {
          progress,
          target: item.achievement.target,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      continue;
    }

    const status = item.projectedStat >= item.achievement.target ? "unlocked" : "in_progress";
    tx.set(
      item.achievementRef,
      {
        achievementId: item.achievement.id,
        title: item.achievement.title,
        rarity: item.achievement.rarity,
        badge: item.achievement.badge,
        progress,
        target: item.achievement.target,
        status,
        ...(status === "unlocked" ? { unlockedAt: FieldValue.serverTimestamp() } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (status === "unlocked") {
      unlocked.push(item.achievement);
    }
  }

  return unlocked;
}

export async function updateAchievementsForEvent({ tx, userRef, userData, action }) {
  const preparedAchievements = await prepareAchievementsForEvent({ tx, userRef, userData, action });
  return writeAchievementsForEvent({ tx, preparedAchievements });
}
