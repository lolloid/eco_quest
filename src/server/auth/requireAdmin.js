import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "./requireUser";

export async function requireAdmin(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult;

  try {
    const userSnap = await adminDb.collection("users").doc(authResult.uid).get();
    const role = userSnap.exists ? userSnap.data().role : null;

    if (role !== "admin") {
      return {
        error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
      };
    }

    return authResult;
  } catch (error) {
    console.error("Admin role check failed:", error);
    return {
      error: NextResponse.json({ error: "Failed to verify admin role" }, { status: 500 }),
    };
  }
}
