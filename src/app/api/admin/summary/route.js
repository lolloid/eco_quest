import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { getAdminSummary } from "@/server/admin/adminEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  try {
    return NextResponse.json({ summary: await getAdminSummary(adminDb) });
  } catch (error) {
    console.error("Failed to load admin summary:", error);
    return NextResponse.json({ error: "Failed to load admin summary" }, { status: 500 });
  }
}
