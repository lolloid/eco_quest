import { FieldValue } from "firebase-admin/firestore";

function serializeInventory(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    itemId: data.itemId || doc.id,
    type: data.type || "item",
    trashType: data.trashType || null,
    rarity: data.rarity || "common",
    quantity: data.quantity || 0,
    updatedAt: data.updatedAt?.toMillis?.() || null,
  };
}

export async function getUserInventory({ db, uid }) {
  const snap = await db.collection("users").doc(uid).collection("inventory").get();
  return snap.docs.map(serializeInventory).sort((a, b) => a.itemId.localeCompare(b.itemId));
}

export async function recycleInventoryItem({ db, uid, trashType, areaId = "starter_park" }) {
  const recyclableTypes = new Set(["plastic", "paper", "metal", "glass", "organic"]);
  const normalizedType = String(trashType || "").toLowerCase();

  if (!recyclableTypes.has(normalizedType)) {
    return {
      success: false,
      reason: "NOT_RECYCLABLE",
      message: "Item ini belum bisa diproses di fasilitas ini.",
      penalty: 1,
    };
  }

  const userRef = db.collection("users").doc(uid);
  const itemRef = userRef.collection("inventory").doc(`trash_${normalizedType}`);
  const areaRef = userRef.collection("worldAreas").doc(areaId);
  const reward = normalizedType === "glass" ? 18 : normalizedType === "metal" ? 16 : normalizedType === "organic" ? 6 : 12;

  return db.runTransaction(async (tx) => {
    const itemSnap = await tx.get(itemRef);
    const areaSnap = await tx.get(areaRef);

    if (!itemSnap.exists || (itemSnap.data().quantity || 0) <= 0) {
      return { success: false, reason: "ITEM_NOT_FOUND", message: "Tidak ada item untuk didaur ulang." };
    }

    const currentQuantity = itemSnap.data().quantity || 0;
    if (currentQuantity <= 1) {
      tx.delete(itemRef);
    } else {
      tx.update(itemRef, {
        quantity: currentQuantity - 1,
        updatedAt: new Date(),
      });
    }

    const currentArea = areaSnap.exists ? areaSnap.data() : {};
    const cleanlinessScore = Math.min(100, (currentArea.cleanlinessScore || 0) + 8);
    const pollutionLevel = Math.max(0, (currentArea.pollutionLevel ?? 100) - 8);

    tx.set(
      areaRef,
      {
        id: areaId,
        name: currentArea.name || areaId,
        requiredLevel: currentArea.requiredLevel || 1,
        cleanlinessScore,
        pollutionLevel,
        status: cleanlinessScore >= 100 ? "clean" : "recovering",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    tx.update(userRef, {
      totalEcoPoints: FieldValue.increment(reward),
      lastActive: new Date(),
    });

    return {
      success: true,
      reward,
      trashType: normalizedType,
      areaId,
      worldUpdate: {
        areaId,
        cleanlinessScore,
        pollutionLevel,
        status: cleanlinessScore >= 100 ? "clean" : "recovering",
      },
    };
  });
}
