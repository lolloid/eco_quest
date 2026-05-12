import { auth } from "@/lib/firebase";

export async function syncSessionCookie(user = auth.currentUser) {
  if (!user) return;

  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error("Failed to sync session cookie");
  }
}

export async function clearSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}
