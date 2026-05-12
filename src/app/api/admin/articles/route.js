import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { listArticleCatalog } from "@/server/admin/adminEngine";
import { getPublishedArticles } from "@/server/education/articleEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  try {
    const articles = await getPublishedArticles(adminDb);
    return NextResponse.json({ articles, fallbackCount: listArticleCatalog().length });
  } catch (error) {
    console.error("Failed to load admin articles:", error);
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
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

  const title = String(body?.title || "").trim();
  const content = String(body?.content || "").trim();
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const id =
    String(body?.id || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_") || `article_${Date.now()}`;

  const article = {
    title,
    content,
    category: String(body?.category || "Umum"),
    emoji: String(body?.emoji || ""),
    readTime: String(body?.readTime || "5 menit"),
    minReadSeconds: Number(body?.minReadSeconds || 30),
    readingReward: {
      ecoPoints: Number(body?.readingReward?.ecoPoints || 15),
      xp: Number(body?.readingReward?.xp || 15),
    },
    summary: String(body?.summary || content.slice(0, 140)),
    isPublished: body?.isPublished !== false,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await adminDb.collection("articles").doc(id).set(article, { merge: true });
  return NextResponse.json({ success: true, article: { id, ...article } });
}

export async function DELETE(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await adminDb.collection("articles").doc(id).set(
    {
      isPublished: false,
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
