"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { AdminShell, AdminState, useAdminApi } from "@/features/admin/AdminClient";
import toast from "react-hot-toast";

const emptyForm = {
  id: "",
  articleId: "",
  question: "",
  optionsText: "Pilihan A\nPilihan B\nPilihan C",
  answerIndex: 0,
  explanation: "",
};

export default function AdminQuizzesPage() {
  const { data, error, loading } = useAdminApi("/api/admin/quizzes");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Quizzes">{state}</AdminShell>;

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const editQuiz = (quiz) => {
    const question = quiz.questions?.[0] || {};
    setForm({
      id: quiz.id,
      articleId: quiz.articleId || "",
      question: question.question || "",
      optionsText: (question.options || []).join("\n"),
      answerIndex: question.answerIndex || 0,
      explanation: question.explanation || "",
    });
  };

  const saveQuiz = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const options = form.optionsText.split("\n").map((item) => item.trim()).filter(Boolean);
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: form.id,
          articleId: form.articleId,
          question: form.question,
          options,
          answerIndex: Number(form.answerIndex),
          explanation: form.explanation,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Quiz tersimpan.");
      setForm(emptyForm);
      window.location.reload();
    } catch {
      toast.error("Gagal menyimpan quiz.");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (id) => {
    if (!confirm("Hapus quiz ini?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/quizzes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Quiz dihapus.");
      window.location.reload();
    } catch {
      toast.error("Gagal menghapus quiz.");
    }
  };

  return (
    <AdminShell title="Quizzes">
      <form onSubmit={saveQuiz} className="glass-card p-5 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input-eco" placeholder="ID opsional" value={form.id} onChange={(e) => setField("id", e.target.value)} />
          <input className="input-eco md:col-span-2" placeholder="Article ID" value={form.articleId} onChange={(e) => setField("articleId", e.target.value)} />
        </div>
        <input className="input-eco" placeholder="Pertanyaan" value={form.question} onChange={(e) => setField("question", e.target.value)} />
        <textarea className="input-eco min-h-28" value={form.optionsText} onChange={(e) => setField("optionsText", e.target.value)} />
        <input className="input-eco" type="number" min="0" value={form.answerIndex} onChange={(e) => setField("answerIndex", e.target.value)} />
        <input className="input-eco" placeholder="Penjelasan jawaban" value={form.explanation} onChange={(e) => setField("explanation", e.target.value)} />
        <div className="flex gap-3">
          <button className="btn-eco text-sm disabled:opacity-50" disabled={saving || !form.articleId || !form.question}>
            {saving ? "Saving..." : "Save Quiz"}
          </button>
          <button type="button" onClick={() => setForm(emptyForm)} className="btn-eco-outline text-sm">Clear</button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.quizzes.map((quiz) => (
          <div key={quiz.id} className="glass-card p-5">
            <h2 className="text-white font-semibold">{quiz.questions?.[0]?.question || quiz.id}</h2>
            <p className="text-gray-500 text-sm mt-1">Article: {quiz.articleId}</p>
            <p className="text-eco-400 text-xs mt-2">Reward: {quiz.reward?.ecoPoints || 30} EP</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => editQuiz(quiz)} className="btn-eco-outline text-xs">Edit</button>
              <button onClick={() => deleteQuiz(quiz.id)} className="px-4 py-2 border border-red-500/40 text-red-400 rounded-lg text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
