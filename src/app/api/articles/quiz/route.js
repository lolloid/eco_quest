import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { getQuizForArticle, submitArticleQuiz } from "@/server/education/quizEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const articleId = request.nextUrl.searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId is required" }, { status: 400 });

  let quiz = null;
  try {
    quiz = await getQuizForArticle(adminDb, articleId);
  } catch (error) {
    console.error("Failed to load quiz:", error);
  }
  if (!quiz) return NextResponse.json({ quiz: null });

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      articleId: quiz.articleId,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        question: question.question,
        options: question.options,
        answerIndex: question.answerIndex,
        explanation: question.explanation,
      })),
      passScore: quiz.passScore || quiz.questions.length,
      reward: quiz.reward || { ecoPoints: 30, xp: 30 },
    },
  });
}

export async function POST(request) {
  const authResult = await requireUser(request);
  if (authResult.error) return authResult.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const articleId = String(body?.articleId || "");
  const answers = Array.isArray(body?.answers) ? body.answers : [];
  if (!articleId) return NextResponse.json({ error: "articleId is required" }, { status: 400 });

  if (authResult.demo) {
    const total = Math.max(answers.length, 1);
    return NextResponse.json({
      success: true,
      demo: true,
      passed: true,
      score: total,
      total,
      rewardGranted: true,
      reward: { ecoPoints: 30, xp: 30 },
    });
  }

  const result = await submitArticleQuiz({
    db: adminDb,
    uid: authResult.uid,
    articleId,
    answers,
  });

  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
