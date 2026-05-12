/**
 * =============================================
 * EcoQuest - Firestore Seed Script
 * =============================================
 *
 * Jalankan: node scripts/seedFirestore.js
 *
 * Sebelum menjalankan:
 * 1. Letakkan file serviceAccountKey.json di root project
 * 2. Atau set environment variable GOOGLE_APPLICATION_CREDENTIALS
 *
 * Script ini akan membuat:
 * - Collection `dailyMissions` (5 misi harian)
 * - Collection `articles` (6 artikel edukasi)
 * - 1 user contoh
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");

// ============================================
// INITIALIZE FIREBASE ADMIN
// ============================================
let serviceAccount;
try {
  serviceAccount = require(path.resolve(__dirname, "../serviceAccountKey.json"));
} catch (e) {
  console.error("❌ serviceAccountKey.json tidak ditemukan!");
  console.log("📝 Cara mendapatkan service account key:");
  console.log("   1. Buka Firebase Console → Project Settings → Service Accounts");
  console.log('   2. Klik "Generate new private key"');
  console.log("   3. Simpan file sebagai serviceAccountKey.json di root project");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ============================================
// SEED DATA
// ============================================

const dailyMissions = [
  {
    id: "mission_1",
    title: "Kumpulkan 5 Sampah di Game",
    description:
      "Mainkan EcoQuest dan kumpulkan minimal 5 sampah di kota virtual.",
    reward: 50,
    icon: "🎮",
    type: "game",
    order: 1,
    isActive: true,
  },
  {
    id: "mission_2",
    title: "Baca 1 Artikel Edukasi",
    description:
      "Kunjungi Education Hub dan baca satu artikel tentang lingkungan.",
    reward: 30,
    icon: "📚",
    type: "education",
    order: 2,
    isActive: true,
  },
  {
    id: "mission_3",
    title: "Daur Ulang di Dunia Nyata",
    description:
      "Pisahkan sampah organik dan anorganik di rumahmu hari ini.",
    reward: 75,
    icon: "♻️",
    type: "real_world",
    order: 3,
    isActive: true,
  },
  {
    id: "mission_4",
    title: "Hemat Air",
    description:
      "Matikan keran saat menyikat gigi dan mandi maksimal 5 menit.",
    reward: 40,
    icon: "💧",
    type: "real_world",
    order: 4,
    isActive: true,
  },
  {
    id: "mission_5",
    title: "Tanya AI Assistant",
    description:
      "Tanyakan tips lingkungan ke EcoAssistant untuk mendapatkan inspirasi baru.",
    reward: 25,
    icon: "🤖",
    type: "ai",
    order: 5,
    isActive: true,
  },
];

const articles = [
  {
    title: "Dampak Sampah Plastik di Lautan",
    category: "Polusi",
    emoji: "🌊",
    readTime: "5 menit",
    content:
      "Setiap tahun, lebih dari 8 juta ton sampah plastik berakhir di lautan. Plastik ini tidak terurai secara alami dan membutuhkan ratusan tahun untuk terdekomposisi.",
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Cara Memulai Komposting di Rumah",
    category: "Daur Ulang",
    emoji: "🌱",
    readTime: "7 menit",
    content:
      "Komposting adalah cara mudah untuk mengurangi sampah organik dan menghasilkan pupuk berkualitas tinggi. Sekitar 30% sampah rumah tangga bisa dikomposkan.",
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Energi Terbarukan: Masa Depan Bumi",
    category: "Energi",
    emoji: "☀️",
    readTime: "6 menit",
    content:
      "Energi terbarukan seperti solar, angin, dan hidropower menjadi solusi utama untuk mengurangi emisi karbon global.",
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Hutan Hujan: Paru-Paru Dunia",
    category: "Ekosistem",
    emoji: "🌳",
    readTime: "5 menit",
    content:
      "Hutan hujan tropis menutupi hanya 6% permukaan bumi, tetapi menghasilkan lebih dari 20% oksigen dunia.",
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Zero Waste: Gaya Hidup Minim Sampah",
    category: "Gaya Hidup",
    emoji: "♻️",
    readTime: "8 menit",
    content:
      "Zero waste adalah filosofi yang bertujuan mengirimkan nol sampah ke tempat pembuangan akhir. Kamu bisa mulai dengan 5R.",
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Perubahan Iklim: Apa yang Harus Kita Tahu",
    category: "Iklim",
    emoji: "🌡️",
    readTime: "6 menit",
    content:
      "Suhu rata-rata bumi telah meningkat sekitar 1.1°C sejak era pra-industri dengan dampak yang sangat besar terhadap ekosistem global.",
    createdAt: FieldValue.serverTimestamp(),
  },
];

const sampleUser = {
  uid: "demo_user_001",
  displayName: "DemoWarrior",
  email: "demo@ecoquest.id",
  totalEcoPoints: 350,
  currentXP: 50,
  level: 3,
  title: "Pahlawan Bumi",
  completedQuests: [],
  badges: ["collector_bronze"],
  trashCollected: 25,
  joinedAt: FieldValue.serverTimestamp(),
  lastActive: FieldValue.serverTimestamp(),
};

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedDailyMissions() {
  console.log("📋 Seeding daily missions...");
  const batch = db.batch();
  dailyMissions.forEach((mission) => {
    const ref = db.collection("dailyMissions").doc(mission.id);
    batch.set(ref, mission);
  });
  await batch.commit();
  console.log(`   ✅ ${dailyMissions.length} daily missions created`);
}

async function seedArticles() {
  console.log("📚 Seeding articles...");
  const batch = db.batch();
  articles.forEach((article, index) => {
    const ref = db.collection("articles").doc(`article_${index + 1}`);
    batch.set(ref, article);
  });
  await batch.commit();
  console.log(`   ✅ ${articles.length} articles created`);
}

async function seedSampleUser() {
  console.log("👤 Seeding sample user...");
  const ref = db.collection("users").doc(sampleUser.uid);
  await ref.set(sampleUser);
  console.log(`   ✅ Sample user "${sampleUser.displayName}" created`);
}

async function main() {
  console.log("🌿 =============================================");
  console.log("🌿 EcoQuest Firestore Seed Script");
  console.log("🌿 =============================================\n");

  try {
    await seedDailyMissions();
    await seedArticles();
    await seedSampleUser();

    console.log("\n🎉 =============================================");
    console.log("🎉 Seed completed successfully!");
    console.log("🎉 =============================================");
    console.log("\nCollections created:");
    console.log("  • dailyMissions (5 documents)");
    console.log("  • articles (6 documents)");
    console.log("  • users (1 demo document)");
    console.log("\n💡 Jalankan `npm run dev` untuk memulai development server.");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
