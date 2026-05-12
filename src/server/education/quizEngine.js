import { FieldValue } from "firebase-admin/firestore";
import { ACTIONS } from "@/domain/actions";
import { DEFAULT_QUIZZES } from "@/domain/quizzes";
import { processActionEvent } from "@/server/rewards/rewardEngine";

export async function getQuizForArticle(db, articleId) {
  try {
    const snap = await db.collection("quizzes").where("articleId", "==", articleId).limit(1).get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() };
    }
  } catch (error) {
    console.error("Failed to load quiz, using fallback:", error);
  }

  return DEFAULT_QUIZZES[articleId] || null;
}

export async function submitArticleQuiz({ db, uid, articleId, answers }) {
  const quiz = await getQuizForArticle(db, articleId);
  if (!quiz) return { success: false, reason: "QUIZ_NOT_FOUND" };

  const score = quiz.questions.reduce((sum, question, index) => {
    return sum + (Number(answers[index]) === question.answerIndex ? 1 : 0);
  }, 0);

  const passed = score >= (quiz.passScore || quiz.questions.length);
  const resultRef = db.collection("users").doc(uid).collection("quizResults").doc(quiz.id);
  const existing = await resultRef.get();
  let rewardResult = null;

  if (passed && !existing.data()?.rewardClaimed) {
    rewardResult = await processActionEvent({
      db,
      uid,
      action: ACTIONS.COMPLETE_QUIZ,
      metadata: {
        articleId,
        quizId: quiz.id,
        clientEventId: `quiz_${quiz.id}`,
      },
    });
  }

  await resultRef.set(
    {
      quizId: quiz.id,
      articleId,
      score,
      total: quiz.questions.length,
      passed,
      rewardClaimed: Boolean(existing.data()?.rewardClaimed || rewardResult?.accepted),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    success: true,
    quizId: quiz.id,
    score,
    total: quiz.questions.length,
    passed,
    rewardGranted: Boolean(rewardResult?.accepted),
    reward: rewardResult?.reward || null,
    explanations: quiz.questions.map((question) => question.explanation),
  };
}
