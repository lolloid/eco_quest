import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { DEMO_PROFILE, isDemoToken } from "@/lib/demoAuth";

export async function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (isDemoToken(token)) {
    return {
      uid: DEMO_PROFILE.uid,
      decoded: {
        uid: DEMO_PROFILE.uid,
        email: DEMO_PROFILE.email,
        name: DEMO_PROFILE.displayName,
      },
      demo: true,
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, decoded };
  } catch (error) {
    console.error("Token verification failed:", error);
    return {
      error: NextResponse.json({ error: "Invalid auth token" }, { status: 401 }),
    };
  }
}
