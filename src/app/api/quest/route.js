import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin (server-side)
function getAdminDb() {
  if (getApps().length === 0) {
    try {
      // Try using service account key file
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccount && serviceAccount !== "./serviceAccountKey.json") {
        const parsed = JSON.parse(serviceAccount);
        initializeApp({ credential: cert(parsed) });
      } else {
        // Fallback: use environment variables for project config
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
    } catch (err) {
      console.error("Firebase Admin init error:", err);
      // Try default initialization
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }
  return getFirestore();
}

/**
 * POST /api/quest
 * Handles quest progress updates and point additions.
 *
 * Body:
 *   { userId: string, action: string, points?: number, missionId?: string }
 *
 * Actions:
 *   - ADD_POINTS: Add eco points to user
 *   - COMPLETE_QUEST: Mark a quest as completed
 *   - COLLECT_TRASH: Increment trash count and add points
 */
export async function POST(request) {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated. Use /api/game/events for action-based rewards.",
    },
    { status: 410 }
  );

  try {
    const body = await request.json();
    const { userId, action, points, missionId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(userId);

    switch (action) {
      case "ADD_POINTS": {
        if (!points || points <= 0) {
          return NextResponse.json(
            { error: "Valid points value required" },
            { status: 400 }
          );
        }

        await userRef.update({
          totalEcoPoints: FieldValue.increment(points),
          currentXP: FieldValue.increment(points),
          lastActive: FieldValue.serverTimestamp(),
        });

        // Check for level up
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          const userData = userSnap.data();
          const levelUpResult = checkLevelUp(userData.level, userData.currentXP);
          if (levelUpResult.shouldLevelUp) {
            await userRef.update({
              level: levelUpResult.newLevel,
              title: levelUpResult.newTitle,
              currentXP: levelUpResult.remainingXP || 0,
            });
            return NextResponse.json({
              success: true,
              levelUp: true,
              newLevel: levelUpResult.newLevel,
              newTitle: levelUpResult.newTitle,
            });
          }
        }

        return NextResponse.json({ success: true, pointsAdded: points });
      }

      case "COLLECT_TRASH": {
        const trashPoints = points || 10;
        await userRef.update({
          totalEcoPoints: FieldValue.increment(trashPoints),
          currentXP: FieldValue.increment(trashPoints),
          trashCollected: FieldValue.increment(1),
          lastActive: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, pointsAdded: trashPoints });
      }

      case "COMPLETE_QUEST": {
        if (!missionId) {
          return NextResponse.json(
            { error: "missionId is required" },
            { status: 400 }
          );
        }

        const today = new Date().toISOString().split("T")[0];
        const progressRef = userRef
          .collection("questProgress")
          .doc(today);

        const progressSnap = await progressRef.get();
        if (progressSnap.exists) {
          await progressRef.update({
            completedMissions: FieldValue.arrayUnion(missionId),
          });
        } else {
          await progressRef.set({
            completedMissions: [missionId],
            date: today,
          });
        }

        // Add reward points
        const reward = points || 50;
        await userRef.update({
          totalEcoPoints: FieldValue.increment(reward),
          currentXP: FieldValue.increment(reward),
          completedQuests: FieldValue.arrayUnion(`${missionId}_${today}`),
          lastActive: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
          success: true,
          missionCompleted: missionId,
          reward,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Quest API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Level-up logic (server-side copy)
 */
function checkLevelUp(currentLevel, currentXP) {
  const thresholds = [
    { level: 2, xp: 100, title: "Penjaga Alam" },
    { level: 3, xp: 250, title: "Pahlawan Bumi" },
    { level: 4, xp: 500, title: "Eco Warrior" },
    { level: 5, xp: 1000, title: "Guardian of Nature" },
    { level: 6, xp: 1800, title: "Eco Champion" },
    { level: 7, xp: 3000, title: "Earth Defender" },
    { level: 8, xp: 5000, title: "Planet Protector" },
    { level: 9, xp: 8000, title: "Eco Legend" },
    { level: 10, xp: 12000, title: "Master of Gaia" },
  ];

  const nextLevel = thresholds.find((t) => t.level === currentLevel + 1);
  if (!nextLevel) return { shouldLevelUp: false };

  const currentThreshold = thresholds.find((t) => t.level === currentLevel);
  const xpNeeded = nextLevel.xp - (currentThreshold?.xp || 0);

  if (currentXP >= xpNeeded) {
    return {
      shouldLevelUp: true,
      newLevel: nextLevel.level,
      newTitle: nextLevel.title,
      remainingXP: currentXP - xpNeeded,
    };
  }

  return { shouldLevelUp: false };
}
