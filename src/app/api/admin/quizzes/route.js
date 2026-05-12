import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { DEFAULT_QUIZZES } from "@/domain/quizzes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallbackQuizzes() {
  return Object.values(DEFAULT_QUIZZES);
}

export async function GET(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  const snap = await adminDb.collection("quizzes").limit(100).get();
  const quizzes = snap.empty ? fallbackQuizzes() : snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ quizzes });
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

  const articleId = String(body?.articleId || "").trim();
  const question = String(body?.question || "").trim();
  const options = Array.isArray(body?.options) ? body.options.map(String).filter(Boolean) : [];
  const answerIndex = Number(body?.answerIndex || 0);

  if (!articleId || !question || options.length < 2 || answerIndex < 0 || answerIndex >= options.length) {
    return NextResponse.json({ error: "Valid articleId, question, options, and answerIndex are required" }, { status: 400 });
  }

  const id =
    String(body?.id || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_") || `quiz_${articleId}`;

  const quiz = {
    articleId,
    passScore: Number(body?.passScore || 1),
    reward: {
      ecoPoints: Number(body?.reward?.ecoPoints || 30),
      xp: Number(body?.reward?.xp || 30),
    },
    questions: [
      {
        id: "q1",
        question,
        options,
        answerIndex,
        explanation: String(body?.explanation || "Jawaban ini paling tepat berdasarkan artikel."),
      },
    ],
    isActive: body?.isActive !== false,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await adminDb.collection("quizzes").doc(id).set(quiz, { merge: true });
  return NextResponse.json({ success: true, quiz: { id, ...quiz } });
}

export async function DELETE(request) {
  const adminResult = await requireAdmin(request);
  if (adminResult.error) return adminResult.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await adminDb.collection("quizzes").doc(id).delete();
  return NextResponse.json({ success: true });
}
