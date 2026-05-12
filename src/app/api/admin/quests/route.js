import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { getQuestCatalog } from "@/server/quests/questEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  return NextResponse.json({ quests: await getQuestCatalog(adminDb) });
}

export async function POST(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = String(body?.title || "").trim();
  const objectiveAction = String(body?.objectiveAction || "COLLECT_TRASH").trim();
  const target = Number(body?.target || 1);

  if (!title || !objectiveAction || target <= 0) {
    return NextResponse.json({ error: "title, objectiveAction, and target are required" }, { status: 400 });
  }

  const id =
    String(body?.id || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_") || `quest_${Date.now()}`;

  const quest = {
    type: String(body?.type || "daily"),
    title,
    description: String(body?.description || title),
    difficulty: String(body?.difficulty || "easy"),
    icon: String(body?.icon || "game"),
    objectives: [
      {
        id: "objective_1",
        action: objectiveAction,
        target,
        ...(body?.filters ? { filters: body.filters } : {}),
      },
    ],
    reward: {
      ecoPoints: Number(body?.reward?.ecoPoints || 25),
      xp: Number(body?.reward?.xp || 25),
    },
    order: Number(body?.order || 99),
    isActive: body?.isActive !== false,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await adminDb.collection("quests").doc(id).set(quest, { merge: true });
  return NextResponse.json({ success: true, quest: { id, ...quest } });
}

export async function DELETE(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await adminDb.collection("quests").doc(id).set(
    {
      isActive: false,
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
