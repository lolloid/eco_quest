"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import PixelIcon from "@/components/ui/PixelIcon";

const OFF_TOPIC_REPLY = "Maaf EcoWarrior, sistemku hanya fokus membantu misi lingkungan.";

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

function isEcoTopic(message) {
  const lower = message.toLowerCase();
  if (/^(hai|halo|hello|hi|pagi|siang|sore|malam)\b/.test(lower)) return true;
  return ECO_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export default function EcoAssistant({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "EcoAssistant online. Aku bisa membantu misi lingkungan, recycle, climate, eco lifestyle, dan hint gameplay PixelTerra.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [learnedCount, setLearnedCount] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 640px)");
    const sync = () => setIsMobileView(Boolean(query?.matches));
    sync();
    query?.addEventListener?.("change", sync);
    return () => query?.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e, presetMessage) => {
    e?.preventDefault?.();
    const userMessage = (presetMessage || input).trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    if (!isEcoTopic(userMessage)) {
      setMessages((prev) => [...prev, { role: "assistant", content: OFF_TOPIC_REPLY }]);
      inputRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          context: {
            userName: profile?.displayName || "EcoWarrior",
            level: profile?.level || 1,
            title: profile?.title || "Pemula Hijau",
            totalEcoPoints: profile?.totalEcoPoints || 0,
            trashCollected: profile?.trashCollected || 0,
            responseStyle: isMobileView ? "mobile_compact" : "standard",
          },
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setLearnedCount((count) => count + 1);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sinyal eco terminal lemah. Coba ulangi sebentar lagi." },
      ]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Eco terminal sedang offline. Kamu tetap bisa bertanya tentang daur ulang, energi, climate, atau hint gameplay setelah koneksi stabil.",
        },
      ]);
      toast.error("Gagal menghubungi AI. Periksa konfigurasi API.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickQuestions = [
    "Beri aku daily eco tips",
    "Quiz singkat tentang recycle",
    "Hint gameplay untuk naik level",
    "Rekomendasikan artikel tentang plastik",
    "Cara memilah baterai bekas?",
  ];

  return (
    <div className="eco-ai-terminal">
      <div className="eco-ai-header">
        <div className="eco-ai-avatar">
          <PixelIcon type="robot" className="is-large" />
          <span />
        </div>
        <div>
          <span className="eco-ai-kicker">COMPANION SYSTEM</span>
          <h3>EcoAssistant</h3>
          <p>{loading ? "typing eco-signal..." : "online | environment scope locked"}</p>
        </div>
        <div className="eco-ai-reward">
          <span>Learning XP</span>
          <strong>+{learnedCount * 5}</strong>
        </div>
      </div>

      <div className="eco-ai-body">
        <aside className="eco-ai-side">
          <div className="eco-ai-module">
            <span>DAILY TIP</span>
            <p>Mulai dari satu aksi: pilah plastik, kertas, kaleng, kaca, dan organik sebelum recycle.</p>
          </div>
          <div className="eco-ai-module">
            <span>ACHIEVEMENT</span>
            <p>{learnedCount >= 3 ? "Eco Learner unlocked." : `${Math.min(learnedCount, 3)}/3 menuju Eco Learner.`}</p>
          </div>
          <div className="eco-ai-module">
            <span>RECOMMENDED</span>
            <p>Buka Education Hub: Panduan Pilah Sampah.</p>
          </div>
        </aside>

        <section className="eco-ai-chat">
          <div className="eco-ai-messages">
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`eco-ai-message ${msg.role === "user" ? "is-user" : "is-ai"}`}>
                {msg.role === "assistant" && <PixelIcon type="robot" className="is-tiny" />}
                <p>{msg.content}</p>
              </div>
            ))}

            {loading && (
              <div className="eco-ai-message is-ai">
                <PixelIcon type="robot" className="is-tiny" />
                <div className="eco-ai-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="eco-ai-chips">
            {quickQuestions.map((q) => (
              <button key={q} type="button" onClick={(event) => sendMessage(event, q)}>
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={sendMessage} className="eco-ai-input-row">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask eco mission, recycle, energy, climate..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <PixelIcon type={loading ? "energy" : "spark"} className="is-tiny" />
              <span>{loading ? "Sync" : "Send"}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
