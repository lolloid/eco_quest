import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OFF_TOPIC_REPLY = "Maaf EcoWarrior, sistemku hanya fokus membantu misi lingkungan.";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b";

const ECO_KEYWORDS = [
  "lingkungan",
  "sampah",
  "recycle",
  "daur",
  "ulang",
  "energi",
  "iklim",
  "climate",
  "plastik",
  "kompos",
  "hutan",
  "laut",
  "air",
  "polusi",
  "satwa",
  "eco",
  "misi",
  "quest",
  "game",
  "xp",
  "badge",
  "level",
  "sustainability",
  "green",
];

export async function POST(request) {
  try {
    const { message, context, conversationId } = await request.json();
    const uid = await getOptionalUid(request);

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!isEcoTopic(message)) {
      const savedConversationId = await saveConversationMessage({
        uid,
        conversationId,
        message,
        reply: OFF_TOPIC_REPLY,
      });
      return NextResponse.json({ reply: OFF_TOPIC_REPLY, conversationId: savedConversationId });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const hasOpenRouterKey =
      openRouterApiKey &&
      !openRouterApiKey.includes("YOUR_OPENROUTER_API_KEY_HERE") &&
      openRouterApiKey.length >= 30;

    if (!hasOpenRouterKey) {
      const reply = getFallbackResponse(message, context);
      const savedConversationId = await saveConversationMessage({
        uid,
        conversationId,
        message,
        reply,
      });

      return NextResponse.json({ reply, conversationId: savedConversationId, provider: "fallback" });
    }

    const isMobileCompact = context?.responseStyle === "mobile_compact";
    const systemPrompt = `You are EcoAssistant AI inside the PixelTerra world.

You help players learn about:
- recycling
- sustainability
- waste management
- renewable energy
- climate change
- eco lifestyle

You also:
- recommend quests
- guide gameplay
- motivate players

Stay inside PixelTerra universe.
Reject unrelated topics.
Speak like a futuristic eco RPG terminal AI.

Informasi pengguna saat ini:
- Nama: ${context?.userName || "EcoWarrior"}
- Level: ${context?.level || 1}
- Title: ${context?.title || "Pemula Hijau"}
- Total EcoPoints: ${context?.totalEcoPoints || 0}
- Sampah Dikumpulkan: ${context?.trashCollected || 0}
- Current Quest: ${context?.currentQuest || "Kumpulkan sampah, recycle, dan buka knowledge rank"}
- Current Map: ${context?.currentMap || "Eco Town"}

Instruksi:
1. Jawab dalam Bahasa Indonesia yang santai dan ramah
2. Gunakan gaya terminal RPG futuristik, tapi tetap mudah dibaca
3. Jangan gunakan emoji berlebihan; prioritaskan teks yang jelas dan rapi
4. Berikan informasi yang akurat tentang lingkungan
5. Jika ditanya di luar topik lingkungan, jawab tepat: "${OFF_TOPIC_REPLY}"
6. Berikan gameplay hint, quest recommendation, atau recycle tips jika relevan
7. Sebutkan nama pengguna kadang-kadang untuk personalisasi
8. Jawab dengan ringkas, maksimal ${isMobileCompact ? "80" : "180"} kata, tapi informatif
9. Untuk mobile_compact, gunakan 2-4 poin pendek dan satu rekomendasi aksi`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "PixelTerra",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: isMobileCompact ? 260 : 500,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API Error:", errorData);
      const reply = getFallbackResponse(message, context);
      const savedConversationId = await saveConversationMessage({
        uid,
        conversationId,
        message,
        reply,
      });

      return NextResponse.json({ reply, conversationId: savedConversationId, provider: "fallback" });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sinyal EcoAssistant melemah. Coba ulangi pertanyaanmu sebentar lagi.";

    const savedConversationId = await saveConversationMessage({
      uid,
      conversationId,
      message,
      reply,
    });

    return NextResponse.json({
      reply,
      conversationId: savedConversationId,
      provider: "openrouter",
      model: data.model || OPENROUTER_MODEL,
    });
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error", reply: "Terjadi kesalahan. Coba lagi nanti." },
      { status: 500 }
    );
  }
}

function isEcoTopic(message) {
  const lower = String(message || "").toLowerCase();
  if (/^(hai|halo|hello|hi|pagi|siang|sore|malam)\b/.test(lower)) return true;
  return ECO_KEYWORDS.some((keyword) => lower.includes(keyword));
}

async function getOptionalUid(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

async function saveConversationMessage({ uid, conversationId, message, reply }) {
  if (!uid) return null;

  const conversationRef = conversationId
    ? adminDb.collection("users").doc(uid).collection("conversations").doc(conversationId)
    : adminDb.collection("users").doc(uid).collection("conversations").doc();

  const userMessageRef = conversationRef.collection("messages").doc();
  const assistantMessageRef = conversationRef.collection("messages").doc();

  await adminDb.runTransaction(async (tx) => {
    tx.set(
      conversationRef,
      {
        title: message.slice(0, 60),
        summary: `Last topic: ${message.slice(0, 120)}`,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    tx.set(userMessageRef, {
      role: "user",
      content: message,
      createdAt: FieldValue.serverTimestamp(),
    });

    tx.set(assistantMessageRef, {
      role: "assistant",
      content: reply,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return conversationRef.id;
}

function getFallbackResponse(message, context) {
  const lowerMsg = message.toLowerCase();
  const name = context?.userName || "EcoWarrior";
  const compact = context?.responseStyle === "mobile_compact";

  if (lowerMsg.includes("daur ulang") || lowerMsg.includes("recycle")) {
    if (compact) {
      return `Eco terminal siap, ${name}.\n\nRecycle loop:\n1. Ambil sampah\n2. Pilah kategorinya\n3. Setor ke station yang sesuai\n4. Klaim XP dan EcoPoints\n\nPrioritas: bersihkan sungai atau taman.`;
    }
    return `Eco terminal siap, ${name}. Daur ulang adalah proses mengubah sampah menjadi bahan baru yang berguna.\n\nQuest hint:\n1. Ambil sampah di map\n2. Pisahkan plastik, kertas, metal, kaca, dan organik\n3. Bawa ke recycle station yang sesuai\n4. Klaim XP dan EcoPoints\n\nPrioritas hari ini: bersihkan area sungai atau taman kota.`;
  }

  if (lowerMsg.includes("plastik")) {
    if (compact) {
      return `Analisis plastik aktif, ${name}.\n\nAksi cepat:\n- Pakai tumbler\n- Bawa tas belanja\n- Tolak sedotan\n- Recycle botol di Eco Center\n\nHint: cari outline terang, lalu tekan E atau tombol interact.`;
    }
    return `Analisis plastik aktif, ${name}. Plastik sulit terurai dan sering masuk ke sungai atau laut.\n\nAksi terbaik:\n- Pakai tumbler\n- Bawa tas belanja\n- Tolak sedotan plastik\n- Recycle botol dan gelas plastik di Eco Center\n\nDi game, cari botol plastik yang punya outline terang lalu tekan E.`;
  }

  if (lowerMsg.includes("iklim") || lowerMsg.includes("climate")) {
    return `Climate module aktif. Perubahan iklim dipicu oleh gas rumah kaca berlebih dari energi fosil, transportasi, deforestasi, dan limbah.\n\nEco action:\n- Hemat listrik\n- Pilih transportasi rendah emisi\n- Kurangi sampah\n- Dukung ruang hijau\n\nQuest rekomendasi: baca artikel Climate lalu selesaikan quiz untuk membuka knowledge XP.`;
  }

  if (lowerMsg.includes("energi") || lowerMsg.includes("listrik") || lowerMsg.includes("hemat")) {
    return `Energy scanner aktif, ${name}.\n\nTips hemat energi:\n1. Matikan lampu saat keluar ruangan\n2. Cabut charger setelah dipakai\n3. Gunakan LED\n4. Atur AC 24-26 derajat Celsius\n5. Manfaatkan cahaya alami\n\nDi PixelTerra, energy habit menaikkan eco reputation.`;
  }

  return `EcoAssistant online, ${name}. Aku bisa membantu tentang recycle, waste management, renewable energy, climate change, eco lifestyle, dan gameplay hint.\n\nRekomendasi misi: ambil sampah terdekat, recycle di station yang sesuai, lalu buka Education Hub untuk membaca satu modul dan klaim XP.`;
}
