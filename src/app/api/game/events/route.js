import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/requireUser";
import { processActionEvent, validateActionEventBody } from "@/server/rewards/rewardEngine";
import { processDemoActionEvent } from "@/server/demo/demoGameStore";

export const runtime = "nodejs";

function isTransactionContention(error) {
  return (
    error?.code === 10 ||
    String(error?.details || error?.message || "")
      .toLowerCase()
      .includes("transaction contention")
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processActionEventWithRetry(params) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await processActionEvent(params);
    } catch (error) {
      if (!isTransactionContention(error) || attempt === maxAttempts) {
        throw error;
      }

      await wait(150 * attempt);
    }
  }
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

  const validation = validateActionEventBody(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    if (authResult.demo) {
      const result = processDemoActionEvent({
        action: validation.value.action,
        metadata: validation.value.metadata,
      });
      return NextResponse.json(result, { status: result.accepted ? 200 : 429 });
    }

    const result = await processActionEventWithRetry({
      db: adminDb,
      uid: authResult.uid,
      action: validation.value.action,
      metadata: validation.value.metadata,
    });

    const status = result.accepted ? 200 : 429;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Game event API error:", error);
    return NextResponse.json(
      { error: "Failed to process game event" },
      { status: 500 }
    );
  }
}
