"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { AdminShell, AdminState, useAdminApi } from "@/features/admin/AdminClient";
import toast from "react-hot-toast";

const emptyForm = {
  id: "",
  title: "",
  description: "",
  objectiveAction: "COLLECT_TRASH",
  target: 1,
  type: "daily",
  difficulty: "easy",
  rewardEcoPoints: 25,
  rewardXP: 25,
};

export default function AdminQuestsPage() {
  const { data, error, loading } = useAdminApi("/api/admin/quests");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="Quests">{state}</AdminShell>;

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const editQuest = (quest) => {
    const objective = quest.objectives?.[0] || {};
    setForm({
      id: quest.id,
      title: quest.title || "",
      description: quest.description || "",
      objectiveAction: objective.action || "COLLECT_TRASH",
      target: objective.target || 1,
      type: quest.type || "daily",
      difficulty: quest.difficulty || "easy",
      rewardEcoPoints: quest.reward?.ecoPoints || 25,
      rewardXP: quest.reward?.xp || 25,
    });
  };

  const saveQuest = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          description: form.description || form.title,
          objectiveAction: form.objectiveAction,
          target: Number(form.target),
          type: form.type,
          difficulty: form.difficulty,
          reward: { ecoPoints: Number(form.rewardEcoPoints), xp: Number(form.rewardXP) },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Quest tersimpan.");
      setForm(emptyForm);
      window.location.reload();
    } catch {
      toast.error("Gagal menyimpan quest.");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuest = async (questId) => {
    if (!confirm("Nonaktifkan quest ini?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/quests?id=${encodeURIComponent(questId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Quest dinonaktifkan.");
      window.location.reload();
    } catch {
      toast.error("Gagal menonaktifkan quest.");
    }
  };

  return (
    <AdminShell title="Quests">
      <form onSubmit={saveQuest} className="glass-card p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="input-eco md:col-span-2" placeholder="ID opsional" value={form.id} onChange={(e) => setField("id", e.target.value)} />
        <select className="input-eco" value={form.type} onChange={(e) => setField("type", e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="main">Main</option>
          <option value="side">Side</option>
          <option value="event">Event</option>
        </select>
        <select className="input-eco" value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input className="input-eco md:col-span-2" placeholder="Judul quest" value={form.title} onChange={(e) => setField("title", e.target.value)} />
        <input className="input-eco md:col-span-2" placeholder="Deskripsi" value={form.description} onChange={(e) => setField("description", e.target.value)} />
        <select className="input-eco" value={form.objectiveAction} onChange={(e) => setField("objectiveAction", e.target.value)}>
          <option value="COLLECT_TRASH">COLLECT_TRASH</option>
          <option value="READ_ARTICLE">READ_ARTICLE</option>
          <option value="TALK_NPC">TALK_NPC</option>
          <option value="COMPLETE_QUIZ">COMPLETE_QUIZ</option>
          <option value="AREA_CLEANED">AREA_CLEANED</option>
        </select>
        <input className="input-eco" type="number" min="1" value={form.target} onChange={(e) => setField("target", e.target.value)} />
        <input className="input-eco" type="number" min="0" value={form.rewardEcoPoints} onChange={(e) => setField("rewardEcoPoints", e.target.value)} />
        <input className="input-eco" type="number" min="0" value={form.rewardXP} onChange={(e) => setField("rewardXP", e.target.value)} />
        <div className="md:col-span-4 flex gap-3">
          <button className="btn-eco text-sm disabled:opacity-50" disabled={saving || !form.title}>
            {saving ? "Saving..." : form.id ? "Save Quest" : "Create Quest"}
          </button>
          <button type="button" onClick={() => setForm(emptyForm)} className="btn-eco-outline text-sm">Clear</button>
        </div>
      </form>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.quests.map((quest) => (
          <div key={quest.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-white font-semibold">{quest.title}</h2>
                <p className="text-gray-500 text-sm">{quest.description}</p>
              </div>
              <span className="badge-eco">{quest.type}</span>
            </div>
            <p className="text-gray-500 text-xs mb-2">Difficulty: {quest.difficulty}</p>
            <p className="text-eco-400 text-sm">Reward: {quest.reward?.ecoPoints || 0} EP / {quest.reward?.xp || 0} XP</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => editQuest(quest)} className="btn-eco-outline text-xs">Edit</button>
              <button onClick={() => deleteQuest(quest.id)} className="px-4 py-2 border border-red-500/40 text-red-400 rounded-lg text-xs">Disable</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
