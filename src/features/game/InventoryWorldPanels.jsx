"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getClientAuthToken } from "@/lib/demoAuth";

function useProtectedGet(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const token = await getClientAuthToken(auth.currentUser);
      const res = await fetch(path, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (error) {
      console.error(`Failed to load ${path}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [path]);

  useEffect(() => {
    const reloadOnGameSync = () => load();
    window.addEventListener("ecoquest:game-sync", reloadOnGameSync);
    return () => window.removeEventListener("ecoquest:game-sync", reloadOnGameSync);
  }, [path]);

  return { data, loading, reload: load };
}

export function InventoryPanel() {
  const { data, loading, reload } = useProtectedGet("/api/inventory");
  const inventory = data?.inventory || [];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-sm text-eco-400">INVENTORY</h2>
        <button onClick={reload} className="text-xs text-gray-500 hover:text-eco-400">Refresh</button>
      </div>
      {loading ? (
        <p className="text-gray-500 text-sm">Memuat inventory...</p>
      ) : inventory.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada item. Kumpulkan sampah di game.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {inventory.map((item) => (
            <div key={item.id} className="bg-pixel-darker border border-pixel-border rounded-lg p-3">
              <p className="text-white text-sm capitalize">{item.trashType || item.itemId}</p>
              <p className="text-gray-500 text-xs">{item.rarity}</p>
              <p className="text-eco-400 font-semibold mt-2">x{item.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorldStatusPanel() {
  const { data, loading, reload } = useProtectedGet("/api/world");
  const areas = data?.areas || [];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-sm text-eco-400">WORLD STATUS</h2>
        <button onClick={reload} className="text-xs text-gray-500 hover:text-eco-400">Refresh</button>
      </div>
      {loading ? (
        <p className="text-gray-500 text-sm">Memuat status dunia...</p>
      ) : (
        <div className="space-y-4">
          {areas.map((area) => (
            <div key={area.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white text-sm">{area.name}</p>
                  <p className="text-gray-600 text-xs capitalize">{area.status}</p>
                </div>
                <span className="badge-eco">{area.cleanlinessScore}% clean</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${area.cleanlinessScore}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
