"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { AdminShell, AdminState, useAdminApi } from "@/features/admin/AdminClient";
import toast from "react-hot-toast";
import PixelIcon from "@/components/ui/PixelIcon";

const emptyForm = {
  id: "",
  title: "",
  category: "Admin CMS",
  emoji: "",
  summary: "",
  content: "",
  minReadSeconds: 30,
  rewardEcoPoints: 15,
  rewardXP: 15,
};

export default function AdminArticlesPage() {
  const { data, error, loading } = useAdminApi("/api/admin/articles");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Articles">{state}</AdminShell>;

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const editArticle = (article) => {
    setForm({
      id: article.id,
      title: article.title || "",
      category: article.category || "Admin CMS",
      emoji: article.emoji || "",
      summary: article.summary || "",
      content: article.content || "",
      minReadSeconds: article.minReadSeconds || 30,
      rewardEcoPoints: article.readingReward?.ecoPoints || 15,
      rewardXP: article.readingReward?.xp || 15,
    });
  };

  const saveArticle = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          content: form.content,
          category: form.category,
          emoji: form.emoji,
          summary: form.summary,
          minReadSeconds: Number(form.minReadSeconds),
          readingReward: {
            ecoPoints: Number(form.rewardEcoPoints),
            xp: Number(form.rewardXP),
          },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Artikel tersimpan.");
      setForm(emptyForm);
      window.location.reload();
    } catch {
      toast.error("Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (articleId) => {
    if (!confirm("Unpublish artikel ini?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(articleId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Artikel di-unpublish.");
      window.location.reload();
    } catch {
      toast.error("Gagal menghapus artikel.");
    }
  };

  return (
    <AdminShell title="Articles">
      <form onSubmit={saveArticle} className="glass-card p-5 mb-6 space-y-3">
        <h2 className="text-white font-semibold">{form.id ? "Edit Article" : "Create Article"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input-eco" placeholder="ID opsional" value={form.id} onChange={(e) => setField("id", e.target.value)} />
          <input className="input-eco" placeholder="Kategori" value={form.category} onChange={(e) => setField("category", e.target.value)} />
          <input className="input-eco" placeholder="Icon label opsional" value={form.emoji} onChange={(e) => setField("emoji", e.target.value)} />
        </div>
        <input className="input-eco" placeholder="Judul artikel" value={form.title} onChange={(e) => setField("title", e.target.value)} />
        <input className="input-eco" placeholder="Ringkasan" value={form.summary} onChange={(e) => setField("summary", e.target.value)} />
        <textarea className="input-eco min-h-32" placeholder="Konten artikel" value={form.content} onChange={(e) => setField("content", e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input-eco" type="number" min="1" value={form.minReadSeconds} onChange={(e) => setField("minReadSeconds", e.target.value)} />
          <input className="input-eco" type="number" min="0" value={form.rewardEcoPoints} onChange={(e) => setField("rewardEcoPoints", e.target.value)} />
          <input className="input-eco" type="number" min="0" value={form.rewardXP} onChange={(e) => setField("rewardXP", e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button className="btn-eco text-sm disabled:opacity-50" disabled={saving || !form.title || !form.content}>
            {saving ? "Saving..." : "Save Article"}
          </button>
          <button type="button" onClick={() => setForm(emptyForm)} className="btn-eco-outline text-sm">Clear</button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.articles.map((article) => (
          <div key={article.id} className="glass-card p-5">
            <div className="mb-2">
              <PixelIcon type="book" className="is-large" />
            </div>
            <h2 className="text-white font-semibold">{article.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{article.summary}</p>
            <p className="text-eco-400 text-xs mt-3">{article.category}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => editArticle(article)} className="btn-eco-outline text-xs">Edit</button>
              <button onClick={() => deleteArticle(article.id)} className="px-4 py-2 border border-red-500/40 text-red-400 rounded-lg text-xs">Unpublish</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
