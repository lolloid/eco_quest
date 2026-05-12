import { FieldValue } from "firebase-admin/firestore";
import { ACTIONS, ACTION_RULES, isKnownAction, normalizeTrashType } from "@/domain/actions";
import { getLevelUpResult } from "@/server/rewards/levelEngine";
import {
  getQuestCatalog,
  prepareQuestProgressForEvent,
  writeQuestProgressForEvent,
} from "@/server/quests/questEngine";
import {
  prepareAchievementsForEvent,
  writeAchievementsForEvent,
} from "@/server/achievements/achievementEngine";
import { prepareWorldForEvent, writeWorldForEvent } from "@/server/world/worldEngine";

function getJakartaDateKey(date = new Date()) {
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  return new Date(date.getTime() + jakartaOffsetMs).toISOString().slice(0, 10);
}

function safeEventId(uid, clientEventId) {
  const raw = `${uid}_${clientEventId || ""}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);
}

export function validateActionEventBody(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }

  if (!isKnownAction(body.action)) {
    return { valid: false, error: "Unknown action" };
  }

  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const clientEventId = String(metadata.clientEventId || "").trim();

  if (!clientEventId || clientEventId.length > 80) {
    return { valid: false, error: "metadata.clientEventId is required" };
  }

  return {
    valid: true,
    value: {
      action: body.action,
      metadata: {
        ...metadata,
        clientEventId,
      },
    },
  };
}

export async function processActionEvent({ db, uid, action, metadata }) {
  const rule = ACTION_RULES[action];
  const nowMs = Date.now();
  const dateKey = getJakartaDateKey(new Date(nowMs));
  const questCatalog = await getQuestCatalog(db);

  const userRef = db.collection("users").doc(uid);
  const eventRef = db.collection("gameEvents").doc(safeEventId(uid, metadata.clientEventId));
  const cooldownRef = userRef.collection("cooldowns").doc(action);
  const dailyStatsRef = userRef.collection("dailyActionStats").doc(dateKey);

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const eventSnap = await tx.get(eventRef);
    const cooldownSnap = await tx.get(cooldownRef);
    const dailyStatsSnap = await tx.get(dailyStatsRef);

    if (!userSnap.exists) {
      return { accepted: false, reason: "USER_NOT_FOUND" };
    }

    if (eventSnap.exists) {
      return { accepted: false, reason: "DUPLICATE_EVENT" };
    }

    const cooldownData = cooldownSnap.exists ? cooldownSnap.data() : {};
    const elapsedMs = nowMs - (cooldownData.lastAtMs || 0);
    if (elapsedMs < rule.cooldownMs) {
      tx.set(eventRef, {
        uid,
        action,
        metadata,
        accepted: false,
        reason: "COOLDOWN",
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.update(userRef, {
        suspiciousScore: FieldValue.increment(1),
        lastActive: FieldValue.serverTimestamp(),
      });
      return { accepted: false, reason: "COOLDOWN", retryAfterMs: rule.cooldownMs - elapsedMs };
    }

    const dailyStats = dailyStatsSnap.exists ? dailyStatsSnap.data() : {};
    const actionCount = dailyStats.actions?.[action] || 0;
    if (actionCount >= rule.dailyLimit) {
      tx.set(eventRef, {
        uid,
        action,
        metadata,
        accepted: false,
        reason: "DAILY_LIMIT",
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.update(userRef, {
        suspiciousScore: FieldValue.increment(3),
        lastActive: FieldValue.serverTimestamp(),
      });
      return { accepted: false, reason: "DAILY_LIMIT" };
    }

    const userData = userSnap.data();
    const preparedQuests = await prepareQuestProgressForEvent({
      tx,
      userRef,
      questCatalog,
      action,
      metadata,
      now: new Date(nowMs),
    });
    const preparedAchievements = await prepareAchievementsForEvent({
      tx,
      userRef,
      userData,
      action,
    });
    const preparedWorld = await prepareWorldForEvent({
      tx,
      userRef,
      action,
      metadata,
    });

    const nextXP = (userData.currentXP || 0) + rule.xp;
    const levelUp = getLevelUpResult(userData.level || 1, nextXP);
    const changedQuestIds = writeQuestProgressForEvent({ tx, preparedQuests });
    const unlockedAchievements = writeAchievementsForEvent({ tx, preparedAchievements });
    const worldUpdate = writeWorldForEvent({
      tx,
      preparedWorld,
    });

    const userPatch = {
      totalEcoPoints: FieldValue.increment(rule.ecoPoints),
      currentXP: levelUp ? levelUp.remainingXP : FieldValue.increment(rule.xp),
      lastActive: FieldValue.serverTimestamp(),
    };

    if (levelUp) {
      userPatch.level = levelUp.newLevel;
      userPatch.title = levelUp.newTitle;
    }

    if (action === ACTIONS.COLLECT_TRASH) {
      userPatch.trashCollected = FieldValue.increment(1);
    }

    if (action === ACTIONS.READ_ARTICLE) {
      userPatch.articlesRead = FieldValue.increment(1);
    }

    if (action === ACTIONS.TALK_NPC) {
      userPatch.npcTalks = FieldValue.increment(1);
    }

    if (unlockedAchievements.length > 0) {
      userPatch.badges = FieldValue.arrayUnion(
        ...unlockedAchievements.map((achievement) => achievement.badge)
      );
      userPatch.totalEcoPoints = FieldValue.increment(
        rule.ecoPoints +
          unlockedAchievements.reduce((sum, achievement) => sum + (achievement.reward?.ecoPoints || 0), 0)
      );
    }

    tx.update(userRef, userPatch);

    if (action === ACTIONS.COLLECT_TRASH && rule.inventory) {
      const trashType = normalizeTrashType(metadata.trashType);
      const inventoryRef = userRef.collection("inventory").doc(`trash_${trashType}`);
      tx.set(
        inventoryRef,
        {
          itemId: `trash_${trashType}`,
          type: "trash",
          trashType,
          rarity: metadata.rarity || "common",
          quantity: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    tx.set(
      dailyStatsRef,
      {
        date: dateKey,
        actions: {
          [action]: FieldValue.increment(1),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    tx.set(cooldownRef, {
      lastAtMs: nowMs,
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(eventRef, {
      uid,
      action,
      metadata,
      reward: {
        ecoPoints: rule.ecoPoints,
        xp: rule.xp,
      },
      accepted: true,
      levelUp: levelUp || null,
      changedQuestIds,
      unlockedAchievements: unlockedAchievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        badge: achievement.badge,
      })),
      worldUpdate,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      accepted: true,
      reward: {
        ecoPoints: rule.ecoPoints,
        xp: rule.xp,
      },
      levelUp,
      changedQuestIds,
      unlockedAchievements: unlockedAchievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        badge: achievement.badge,
      })),
      worldUpdate,
    };
  });
}
