import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { getQuestsForUser } from "@/server/quests/questEngine";
import { getDemoQuests } from "@/server/demo/demoGameStore";

export const runtime = "nodejs";

export async function GET(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  try {
    if (authResult.demo) {
      return NextResponse.json({ quests: getDemoQuests(), demo: true });
    }

    const quests = await getQuestsForUser({
      db: adminDb,
      uid: authResult.uid,
    });

    return NextResponse.json({ quests });
  } catch (error) {
    console.error("Failed to load quests:", error);
    return NextResponse.json({ error: "Failed to load quests" }, { status: 500 });
  }
}
