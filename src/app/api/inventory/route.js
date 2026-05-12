import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { getUserInventory } from "@/server/inventory/inventoryEngine";
import { getDemoInventory } from "@/server/demo/demoGameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  try {
    if (authResult.demo) {
      return NextResponse.json({ inventory: getDemoInventory(), demo: true });
    }

    return NextResponse.json({ inventory: await getUserInventory({ db: adminDb, uid: authResult.uid }) });
  } catch (error) {
    console.error("Failed to load inventory:", error);
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
  }
}
