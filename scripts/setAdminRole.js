const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (raw) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) return JSON.parse(trimmed);

    const resolvedPath = path.isAbsolute(trimmed)
      ? trimmed
      : path.resolve(process.cwd(), trimmed);
    if (fs.existsSync(resolvedPath)) {
      return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    }
  }

  const fallbackPath = path.resolve(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(fallbackPath)) {
    return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
  }

  throw new Error(
    "Service account tidak ditemukan. Set FIREBASE_SERVICE_ACCOUNT_KEY atau letakkan serviceAccountKey.json di root project."
  );
}

async function main() {
  const identifier = process.argv[2];
  const role = process.argv[3] || "admin";

  if (!identifier) {
    console.error("Usage: node scripts/setAdminRole.js <email-or-uid> [admin|user]");
    process.exit(1);
  }

  if (!["admin", "user"].includes(role)) {
    console.error('Role hanya boleh "admin" atau "user".');
    process.exit(1);
  }

  const serviceAccount = loadServiceAccount();
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }

  const auth = getAuth();
  const db = getFirestore();

  const userRecord = identifier.includes("@")
    ? await auth.getUserByEmail(identifier)
    : await auth.getUser(identifier);

  await db.collection("users").doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email: userRecord.email || "",
      displayName: userRecord.displayName || userRecord.email || "EcoWarrior",
      role,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`Role "${role}" berhasil dipasang untuk ${userRecord.email || userRecord.uid}.`);
}

main().catch((error) => {
  console.error("Gagal mengubah role:", error.message);
  process.exit(1);
});
