import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getNpcCatalog } from "@/server/npc/npcEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ npcs: await getNpcCatalog(adminDb) });
}
