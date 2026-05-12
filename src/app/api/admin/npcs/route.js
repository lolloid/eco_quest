import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { getNpcCatalog } from "@/server/npc/npcEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  return NextResponse.json({ npcs: await getNpcCatalog(adminDb) });
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

  const name = String(body?.name || "").trim();
  const message = String(body?.message || "").trim();
  if (!name || !message) {
    return NextResponse.json({ error: "name and message are required" }, { status: 400 });
  }

  const id =
    String(body?.id || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_") || `npc_${Date.now()}`;

  const npc = {
    name,
    label: String(body?.label || name),
    role: String(body?.role || "guide"),
    areaId: String(body?.areaId || "starter_park"),
    x: Number(body?.x || 400),
    y: Number(body?.y || 350),
    shirtColor: Number(body?.shirtColor || 0x27ae60),
    skinColor: Number(body?.skinColor || 0xf5deb3),
    message,
    isActive: body?.isActive !== false,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await adminDb.collection("npcs").doc(id).set(npc, { merge: true });
  return NextResponse.json({ success: true, npc: { id, ...npc } });
}

export async function DELETE(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await adminDb.collection("npcs").doc(id).set(
    {
      isActive: false,
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
