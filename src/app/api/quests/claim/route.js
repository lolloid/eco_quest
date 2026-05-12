import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { claimQuestReward } from "@/server/quests/questEngine";
import { claimDemoQuest } from "@/server/demo/demoGameStore";

export const runtime = "nodejs";

export async function POST(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questId = String(body?.questId || "").trim();
  if (!questId) {
    return NextResponse.json({ error: "questId is required" }, { status: 400 });
  }

  try {
    if (authResult.demo) {
      const result = claimDemoQuest(questId);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const result = await claimQuestReward({
      db: adminDb,
      uid: authResult.uid,
      questId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to claim quest:", error);
    return NextResponse.json({ error: "Failed to claim quest" }, { status: 500 });
  }
}
