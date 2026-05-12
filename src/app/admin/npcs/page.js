"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { AdminShell, AdminState, useAdminApi } from "@/features/admin/AdminClient";
import toast from "react-hot-toast";

const emptyForm = {
  id: "",
  name: "",
  label: "",
  role: "guide",
  areaId: "starter_park",
  x: 400,
  y: 350,
  message: "",
};

export default function AdminNpcsPage() {
  const { data, error, loading } = useAdminApi("/api/admin/npcs");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const state = <AdminState loading={loading} error={error} />;
  if (loading || error) return <AdminShell title="NPCs">{state}</AdminShell>;

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveNpc = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/npcs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, x: Number(form.x), y: Number(form.y) }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("NPC tersimpan.");
      setForm(emptyForm);
      window.location.reload();
    } catch {
      toast.error("Gagal menyimpan NPC.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNpc = async (id) => {
    if (!confirm("Nonaktifkan NPC ini?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/npcs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("NPC dinonaktifkan.");
      window.location.reload();
    } catch {
      toast.error("Gagal menonaktifkan NPC.");
    }
  };

  return (
    <AdminShell title="NPCs">
      <form onSubmit={saveNpc} className="glass-card p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="input-eco" placeholder="ID opsional" value={form.id} onChange={(e) => setField("id", e.target.value)} />
        <input className="input-eco" placeholder="Nama" value={form.name} onChange={(e) => setField("name", e.target.value)} />
        <input className="input-eco" placeholder="Label" value={form.label} onChange={(e) => setField("label", e.target.value)} />
        <select className="input-eco" value={form.role} onChange={(e) => setField("role", e.target.value)}>
          <option value="guide">Guide</option>
          <option value="quest_giver">Quest Giver</option>
          <option value="story">Story</option>
        </select>
        <input className="input-eco" placeholder="Area" value={form.areaId} onChange={(e) => setField("areaId", e.target.value)} />
        <input className="input-eco" type="number" value={form.x} onChange={(e) => setField("x", e.target.value)} />
        <input className="input-eco" type="number" value={form.y} onChange={(e) => setField("y", e.target.value)} />
        <input className="input-eco md:col-span-4" placeholder="Dialog NPC" value={form.message} onChange={(e) => setField("message", e.target.value)} />
        <div className="md:col-span-4 flex gap-3">
          <button className="btn-eco text-sm disabled:opacity-50" disabled={saving || !form.name || !form.message}>
            {saving ? "Saving..." : "Save NPC"}
          </button>
          <button type="button" onClick={() => setForm(emptyForm)} className="btn-eco-outline text-sm">Clear</button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.npcs.map((npc) => (
          <div key={npc.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-white font-semibold">{npc.name}</h2>
                <p className="text-gray-500 text-sm">{npc.message}</p>
              </div>
              <span className="badge-eco">{npc.role}</span>
            </div>
            <p className="text-gray-600 text-xs mt-3">{npc.areaId} • ({npc.x}, {npc.y})</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setForm({ ...emptyForm, ...npc })} className="btn-eco-outline text-xs">Edit</button>
              <button onClick={() => deleteNpc(npc.id)} className="px-4 py-2 border border-red-500/40 text-red-400 rounded-lg text-xs">Disable</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
