import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { updateArticleProgress } from "@/server/education/articleEngine";

export const runtime = "nodejs";

export async function POST(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const articleId = String(body?.articleId || "").trim();
  if (!articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  try {
    if (authResult.demo) {
      return NextResponse.json({
        success: true,
        demo: true,
        progress: {
          articleId,
          readingSeconds: Math.max(1, Number(body?.readingSecondsDelta || 0)),
          completed: Boolean(body?.completed),
          rewardClaimed: Boolean(body?.completed),
          bookmarked: Boolean(body?.bookmarked),
        },
        rewardGranted: Boolean(body?.completed),
        reward: Boolean(body?.completed) ? { ecoPoints: 15, xp: 15 } : null,
      });
    }

    const result = await updateArticleProgress({
      db: adminDb,
      uid: authResult.uid,
      articleId,
      readingSecondsDelta: Number(body?.readingSecondsDelta || 0),
      completed: Boolean(body?.completed),
      bookmarked: typeof body?.bookmarked === "boolean" ? body.bookmarked : undefined,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update article progress:", error);
    return NextResponse.json({ error: "Failed to update article progress" }, { status: 500 });
  }
}
