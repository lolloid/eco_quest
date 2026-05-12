import { DEFAULT_NPCS } from "@/domain/npcs";

function serializeNpc(doc) {
  return { id: doc.id, ...doc.data() };
}

export async function getNpcCatalog(db) {
  try {
    const snap = await db.collection("npcs").where("isActive", "==", true).get();
    if (!snap.empty) return snap.docs.map(serializeNpc);
  } catch (error) {
    console.error("Failed to load NPC catalog, using fallback:", error);
  }

  return DEFAULT_NPCS;
}
