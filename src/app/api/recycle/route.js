import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { recycleInventoryItem } from "@/server/inventory/inventoryEngine";
import { recycleDemoInventoryItem } from "@/server/demo/demoGameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trashType = String(body?.trashType || "").trim();
  const areaId = String(body?.areaId || "starter_park").trim();
  if (!trashType) return NextResponse.json({ error: "trashType is required" }, { status: 400 });

  try {
    if (authResult.demo) {
      const result = recycleDemoInventoryItem({ trashType, areaId });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const result = await recycleInventoryItem({
      db: adminDb,
      uid: authResult.uid,
      trashType,
      areaId,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Recycle API error:", error);
    return NextResponse.json({ error: "Failed to recycle item" }, { status: 500 });
  }
}
