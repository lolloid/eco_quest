import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedArticles } from "@/server/education/articleEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await getPublishedArticles(adminDb);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Failed to load articles:", error);
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
}
