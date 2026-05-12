import { FieldValue } from "firebase-admin/firestore";
import { ACTIONS } from "@/domain/actions";

export const DEFAULT_WORLD_AREAS = [
  {
    id: "starter_park",
    name: "Starter Park",
    requiredLevel: 1,
    cleanlinessScore: 0,
    pollutionLevel: 100,
    status: "dirty",
  },
];

function getBaseArea(areaId) {
  return DEFAULT_WORLD_AREAS.find((area) => area.id === areaId) || DEFAULT_WORLD_AREAS[0];
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

export async function prepareWorldForEvent({ tx, userRef, action, metadata }) {
  const areaId = metadata.areaId || "starter_park";
  const areaRef = userRef.collection("worldAreas").doc(areaId);
  const baseArea = getBaseArea(areaId);

  if (action !== ACTIONS.AREA_CLEANED && action !== ACTIONS.COLLECT_TRASH) {
    return { action, areaId, areaRef, baseArea, snap: null };
  }

  return {
    action,
    areaId,
    areaRef,
    baseArea,
    snap: await tx.get(areaRef),
  };
}

export function writeWorldForEvent({ tx, preparedWorld }) {
  const { action, areaId, areaRef, baseArea, snap } = preparedWorld;

  if (action === ACTIONS.AREA_CLEANED) {
    tx.set(
      areaRef,
      {
        id: areaId,
        name: baseArea.name || "Starter Park",
        requiredLevel: baseArea.requiredLevel || 1,
        cleanlinessScore: 100,
        pollutionLevel: 0,
        status: "clean",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { areaId, cleanlinessScore: 100, pollutionLevel: 0, status: "clean" };
  }

  if (action !== ACTIONS.COLLECT_TRASH) {
    return null;
  }

  const current = snap?.exists ? snap.data() : baseArea;
  const cleanlinessScore = clampScore((current.cleanlinessScore ?? 0) + 5);
  const pollutionLevel = clampScore((current.pollutionLevel ?? 100) - 5);
  const status = cleanlinessScore >= 100 ? "clean" : "recovering";

  tx.set(
    areaRef,
    {
      id: areaId,
      name: baseArea.name || "Starter Park",
      requiredLevel: baseArea.requiredLevel || 1,
      cleanlinessScore,
      pollutionLevel,
      status,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { areaId, cleanlinessScore, pollutionLevel, status };
}

export async function updateWorldForEvent({ tx, userRef, action, metadata }) {
  const preparedWorld = await prepareWorldForEvent({ tx, userRef, action, metadata });
  return writeWorldForEvent({ tx, preparedWorld });
}

export async function getUserWorld({ db, uid }) {
  const snap = await db.collection("users").doc(uid).collection("worldAreas").get();
  if (snap.empty) return DEFAULT_WORLD_AREAS;

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || doc.id,
      requiredLevel: data.requiredLevel || 1,
      cleanlinessScore: data.cleanlinessScore || 0,
      pollutionLevel: data.pollutionLevel ?? 100,
      status: data.status || "dirty",
      updatedAt: data.updatedAt?.toMillis?.() || null,
    };
  });
}
