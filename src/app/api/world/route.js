import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { getUserWorld } from "@/server/world/worldEngine";
import { getDemoWorld } from "@/server/demo/demoGameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  try {
    if (authResult.demo) {
      return NextResponse.json({ areas: getDemoWorld(), demo: true });
    }

    return NextResponse.json({ areas: await getUserWorld({ db: adminDb, uid: authResult.uid }) });
  } catch (error) {
    console.error("Failed to load world status:", error);
    return NextResponse.json({ error: "Failed to load world status" }, { status: 500 });
  }
}
