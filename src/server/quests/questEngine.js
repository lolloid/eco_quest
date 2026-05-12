import { FieldValue } from "firebase-admin/firestore";
import { DEFAULT_QUESTS, QUEST_STATUS, getQuestCycleKey, objectiveMatchesEvent } from "@/domain/quests";
import { getLevelUpResult } from "@/server/rewards/levelEngine";

function serializeQuestDoc(doc) {
  return { id: doc.id, ...doc.data() };
}

export async function getQuestCatalog(db) {
  try {
    const snap = await db.collection("quests").where("isActive", "==", true).get();
    if (!snap.empty) {
      const firestoreQuests = snap.docs
        .map(serializeQuestDoc)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const seen = new Set(firestoreQuests.map((quest) => quest.id));
      const fallbackFill = DEFAULT_QUESTS.filter((quest) => !seen.has(quest.id));
      return [...firestoreQuests, ...fallbackFill].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (error) {
    console.error("Failed to load Firestore quests, using fallback:", error);
  }

  return DEFAULT_QUESTS;
}

function createInitialProgress(quest, cycleKey) {
  const objectives = {};
  quest.objectives.forEach((objective) => {
    objectives[objective.id] = {
      current: 0,
      target: objective.target,
      completed: false,
    };
  });

  return {
    questId: quest.id,
    type: quest.type,
    cycleKey,
    status: QUEST_STATUS.ACTIVE,
    objectives,
  };
}

function applyObjectiveProgress(quest, progress, action, metadata) {
  const nextProgress = {
    ...progress,
    objectives: { ...(progress.objectives || {}) },
  };

  quest.objectives.forEach((objective) => {
    if (!objectiveMatchesEvent(objective, action, metadata)) return;

    const current = nextProgress.objectives[objective.id] || {
      current: 0,
      target: objective.target,
      completed: false,
    };

    const nextValue = Math.min((current.current || 0) + 1, objective.target);
    nextProgress.objectives[objective.id] = {
      current: nextValue,
      target: objective.target,
      completed: nextValue >= objective.target,
    };
  });

  const completed = quest.objectives.every(
    (objective) => nextProgress.objectives[objective.id]?.completed
  );

  if (completed && nextProgress.status !== QUEST_STATUS.CLAIMED) {
    nextProgress.status = QUEST_STATUS.COMPLETED;
    nextProgress.completedAt = FieldValue.serverTimestamp();
  }

  return nextProgress;
}

export async function prepareQuestProgressForEvent({ tx, userRef, questCatalog, action, metadata, now = new Date() }) {
  const matchingQuests = questCatalog.filter(
    (quest) =>
      quest.isActive &&
      quest.objectives.some((objective) => objectiveMatchesEvent(objective, action, metadata))
  );

  const reads = [];
  for (const quest of matchingQuests) {
    const progressRef = userRef.collection("questProgress").doc(quest.id);
    reads.push({
      quest,
      progressRef,
      cycleKey: getQuestCycleKey(quest, now),
      snap: await tx.get(progressRef),
      action,
      metadata,
    });
  }

  return reads;
}

export function writeQuestProgressForEvent({ tx, preparedQuests }) {
  const changedQuestIds = [];
  for (const item of preparedQuests) {
    const current =
      item.snap.exists && item.snap.data().cycleKey === item.cycleKey
        ? item.snap.data()
        : createInitialProgress(item.quest, item.cycleKey);

    if (current.status === QUEST_STATUS.CLAIMED) continue;

    const next = applyObjectiveProgress(item.quest, current, item.action, item.metadata);
    changedQuestIds.push(item.quest.id);

    tx.set(
      item.progressRef,
      {
        ...next,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return changedQuestIds;
}

export async function updateQuestProgressForEvent({ tx, userRef, questCatalog, action, metadata, now = new Date() }) {
  const preparedQuests = await prepareQuestProgressForEvent({
    tx,
    userRef,
    questCatalog,
    action,
    metadata,
    now,
  });
  return writeQuestProgressForEvent({ tx, preparedQuests });
}

export async function getQuestsForUser({ db, uid }) {
  const questCatalog = await getQuestCatalog(db);
  const progressSnap = await db
    .collection("users")
    .doc(uid)
    .collection("questProgress")
    .get();

  const progressById = new Map(progressSnap.docs.map((doc) => [doc.id, doc.data()]));
  const now = new Date();

  return questCatalog.filter((quest) => quest.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((quest) => {
      const cycleKey = getQuestCycleKey(quest, now);
      const saved = progressById.get(quest.id);
      const progress =
        saved && saved.cycleKey === cycleKey ? saved : createInitialProgress(quest, cycleKey);

      return {
        ...quest,
        progress,
      };
    });
}

export async function claimQuestReward({ db, uid, questId }) {
  const questCatalog = await getQuestCatalog(db);
  const quest = questCatalog.find((item) => item.id === questId && item.isActive);
  if (!quest) return { success: false, reason: "QUEST_NOT_FOUND" };

  const userRef = db.collection("users").doc(uid);
  const progressRef = userRef.collection("questProgress").doc(quest.id);
  const cycleKey = getQuestCycleKey(quest);

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const progressSnap = await tx.get(progressRef);

    if (!userSnap.exists) return { success: false, reason: "USER_NOT_FOUND" };
    if (!progressSnap.exists) return { success: false, reason: "QUEST_NOT_COMPLETED" };

    const progress = progressSnap.data();
    if (progress.cycleKey !== cycleKey) return { success: false, reason: "QUEST_EXPIRED" };
    if (progress.status === QUEST_STATUS.CLAIMED) return { success: false, reason: "ALREADY_CLAIMED" };
    if (progress.status !== QUEST_STATUS.COMPLETED) {
      return { success: false, reason: "QUEST_NOT_COMPLETED" };
    }

    const reward = quest.reward || { ecoPoints: 0, xp: 0 };
    const userData = userSnap.data();
    const nextXP = (userData.currentXP || 0) + (reward.xp || 0);
    const levelUp = getLevelUpResult(userData.level || 1, nextXP);

    tx.update(userRef, {
      totalEcoPoints: FieldValue.increment(reward.ecoPoints || 0),
      currentXP: levelUp ? levelUp.remainingXP : FieldValue.increment(reward.xp || 0),
      ...(levelUp ? { level: levelUp.newLevel, title: levelUp.newTitle } : {}),
      completedQuests: FieldValue.arrayUnion(`${quest.id}_${cycleKey}`),
      lastActive: FieldValue.serverTimestamp(),
    });

    tx.set(
      progressRef,
      {
        status: QUEST_STATUS.CLAIMED,
        claimedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      success: true,
      reward,
      levelUp,
    };
  });
}
