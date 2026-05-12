import { FieldValue } from "firebase-admin/firestore";
import { DEFAULT_ARTICLES } from "@/domain/articles";
import { ACTIONS } from "@/domain/actions";
import { processActionEvent } from "@/server/rewards/rewardEngine";

function serializeDoc(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toMillis?.() || null,
    updatedAt: data.updatedAt?.toMillis?.() || null,
  };
}

export async function getPublishedArticles(db) {
  try {
    const snap = await db.collection("articles").where("isPublished", "==", true).get();
    if (!snap.empty) {
      const firestoreArticles = snap.docs.map(serializeDoc);
      const seen = new Set(firestoreArticles.map((article) => article.id));
      const fallbackFill = DEFAULT_ARTICLES.filter((article) => !seen.has(article.id));
      return [...firestoreArticles, ...fallbackFill].slice(0, Math.max(12, firestoreArticles.length));
    }
  } catch (error) {
    console.error("Failed to load Firestore articles, using fallback:", error);
  }

  return DEFAULT_ARTICLES;
}

export async function getArticleById(db, articleId) {
  const snap = await db.collection("articles").doc(articleId).get();
  if (snap.exists) return { id: snap.id, ...snap.data() };
  return DEFAULT_ARTICLES.find((article) => article.id === articleId) || null;
}

export async function updateArticleProgress({ db, uid, articleId, readingSecondsDelta, completed, bookmarked }) {
  const article = await getArticleById(db, articleId);
  if (!article || article.isPublished === false) {
    return { success: false, reason: "ARTICLE_NOT_FOUND" };
  }

  const progressRef = db.collection("users").doc(uid).collection("articleProgress").doc(articleId);
  const minReadSeconds = article.minReadSeconds || 30;
  let shouldGrantReward = false;
  let progressResult = null;

  await db.runTransaction(async (tx) => {
    const progressSnap = await tx.get(progressRef);
    const current = progressSnap.exists ? progressSnap.data() : {};
    const nextSeconds = Math.max(0, (current.readingSeconds || 0) + (readingSecondsDelta || 0));
    const canComplete = completed && nextSeconds >= minReadSeconds;
    shouldGrantReward = Boolean(canComplete && !current.rewardClaimed);

    progressResult = {
      articleId,
      readingSeconds: nextSeconds,
      completed: Boolean(current.completed || canComplete),
      rewardClaimed: Boolean(current.rewardClaimed),
      bookmarked: typeof bookmarked === "boolean" ? bookmarked : Boolean(current.bookmarked),
    };

    tx.set(
      progressRef,
      {
        ...progressResult,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  let rewardResult = null;
  if (shouldGrantReward) {
    rewardResult = await processActionEvent({
      db,
      uid,
      action: ACTIONS.READ_ARTICLE,
      metadata: {
        articleId,
        articleCategory: article.category,
        clientEventId: `read_${articleId}`,
      },
    });

    if (rewardResult?.accepted) {
      await progressRef.set(
        {
          rewardClaimed: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      progressResult.rewardClaimed = true;
    }
  }

  return {
    success: true,
    progress: progressResult,
    rewardGranted: Boolean(shouldGrantReward && rewardResult?.accepted),
    reward: rewardResult?.reward || null,
  };
}
