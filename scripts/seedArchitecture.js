const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

function loadDotEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  });
}

function resolveServiceAccount() {
  loadDotEnvLocal();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidates = [
    raw,
    "serviceAccountKey.json",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const trimmed = String(candidate).trim();
    if (trimmed.startsWith("{")) return JSON.parse(trimmed);

    const resolvedPath = path.isAbsolute(trimmed)
      ? trimmed
      : path.resolve(__dirname, "..", trimmed);

    if (fs.existsSync(resolvedPath)) {
      return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    }
  }

  console.error("Service account tidak ditemukan.");
  console.error("Tambahkan serviceAccountKey.json di root project, atau isi FIREBASE_SERVICE_ACCOUNT_KEY/GOOGLE_APPLICATION_CREDENTIALS.");
  process.exit(1);
}

const serviceAccount = resolveServiceAccount();
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const quests = [
  {
    id: "daily_collect_5_trash",
    type: "daily",
    title: "Kumpulkan 5 Sampah",
    description: "Bersihkan kota virtual dengan mengumpulkan 5 sampah.",
    difficulty: "easy",
    icon: "game",
    objectives: [{ id: "collect_trash", action: "COLLECT_TRASH", target: 5 }],
    reward: { ecoPoints: 50, xp: 50 },
    order: 1,
    isActive: true,
  },
  {
    id: "daily_quiz",
    type: "daily",
    title: "Selesaikan 1 Quiz",
    description: "Baca artikel dan jawab quiz edukasi.",
    difficulty: "medium",
    icon: "education",
    objectives: [{ id: "complete_quiz", action: "COMPLETE_QUIZ", target: 1 }],
    reward: { ecoPoints: 60, xp: 60 },
    order: 2,
    isActive: true,
  },
];

const npcs = [
  {
    id: "prof_eco",
    name: "Prof. Eco",
    label: "Prof. Eco",
    role: "guide",
    areaId: "starter_park",
    x: 400,
    y: 350,
    shirtColor: 2201331,
    skinColor: 16113331,
    message: "Selamat datang, EcoWarrior! Bersihkan area dan pelajari cara menjaga bumi.",
    isActive: true,
  },
  {
    id: "ranger_adi",
    name: "Ranger Adi",
    label: "Ranger Adi",
    role: "quest_giver",
    areaId: "starter_park",
    x: 200,
    y: 200,
    shirtColor: 2600544,
    skinColor: 13935988,
    message: "Mulailah dari memilah sampah. Sampah kecil pun bisa berdampak besar.",
    isActive: true,
  },
];

const articles = [
  {
    id: "article_plastic_ocean",
    title: "Dampak Sampah Plastik di Lautan",
    category: "Polusi",
    emoji: "🌊",
    readTime: "5 menit",
    minReadSeconds: 5,
    readingReward: { ecoPoints: 15, xp: 15 },
    summary: "Mengapa plastik menjadi ancaman besar bagi ekosistem laut.",
    content: "Sampah plastik di laut membahayakan hewan dan rantai makanan. Kurangi plastik sekali pakai dan gunakan barang reusable.",
    isPublished: true,
  },
];

const quizzes = [
  {
    id: "quiz_plastic_ocean",
    articleId: "article_plastic_ocean",
    passScore: 1,
    reward: { ecoPoints: 30, xp: 30 },
    questions: [
      {
        id: "q1",
        question: "Apa cara mengurangi sampah plastik?",
        options: ["Memakai botol reusable", "Membuang ke sungai", "Membakar semua plastik"],
        answerIndex: 0,
        explanation: "Botol reusable mengurangi plastik sekali pakai.",
      },
    ],
    isActive: true,
  },
];

async function seedCollection(name, rows) {
  const batch = db.batch();
  rows.forEach((row) => {
    const { id, ...data } = row;
    batch.set(
      db.collection(name).doc(id),
      {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
  await batch.commit();
  console.log(`${name}: ${rows.length} documents seeded`);
}

async function main() {
  await seedCollection("quests", quests);
  await seedCollection("npcs", npcs);
  await seedCollection("articles", articles);
  await seedCollection("quizzes", quizzes);
  console.log("Architecture seed completed.");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
