import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { listSuspiciousUsers } from "@/server/admin/adminEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  try {
    return NextResponse.json({ users: await listSuspiciousUsers(adminDb) });
  } catch (error) {
    console.error("Failed to load suspicious users:", error);
    return NextResponse.json({ error: "Failed to load suspicious users" }, { status: 500 });
  }
}
