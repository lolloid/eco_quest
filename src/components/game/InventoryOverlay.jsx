"use client";

import PixelIcon from "@/components/ui/PixelIcon";

const CATEGORY_ICONS = {
  plastik: "bottle",
  kertas: "book",
  kaleng: "trash",
  kaca: "bottle",
  organik: "leaf",
};

function getCategoryIcon(type, meta) {
  return CATEGORY_ICONS[type] || CATEGORY_ICONS[meta?.category] || "trash";
}

export default function InventoryOverlay({
  inventoryStacks,
  categories,
  capacity,
  total,
  onClose,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Escape" || e.key === "i" || e.key === "I") {
      onClose();
    }
  };

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="w-full max-w-xl animate-slide-up rounded-xl border-2 border-emerald-400/40 bg-[#0a1420]/95 p-5 shadow-2xl backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-pixel text-sm text-emerald-300 flex items-center gap-2">
              <PixelIcon type="trash" className="is-nav" />
              INVENTORY
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Kapasitas: {total}/{capacity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-600 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-gray-400"
          >
            Tutup
          </button>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min((total / capacity) * 100, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(categories).map(([type, meta]) => {
            const qty = inventoryStacks[type] || 0;
            const hasItems = qty > 0;

            return (
              <div
                key={type}
                className={`rounded-lg border p-3 transition-all ${
                  hasItems
                    ? "border-emerald-500/30 bg-slate-900/80 shadow-lg shadow-emerald-500/5"
                    : "border-slate-700/50 bg-slate-950/60"
                }`}
              >
                <div className="mx-auto mb-2 flex justify-center">
                  <PixelIcon type={getCategoryIcon(type, meta)} className="is-nav" />
                </div>

                <p className={`text-center text-xs ${hasItems ? "text-white" : "text-gray-500"}`}>
                  {meta.label}
                </p>

                <p className="mt-0.5 text-center text-[10px] text-gray-600">
                  {meta.category}
                </p>

                <p
                  className={`mt-1.5 text-center font-pixel text-xs ${
                    hasItems ? "text-emerald-300" : "text-gray-600"
                  }`}
                >
                  x{qty}
                </p>
              </div>
            );
          })}

          {Array.from({ length: Math.max(0, 10 - Object.keys(categories).length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-[100px] rounded-lg border border-slate-800/40 bg-slate-950/30"
            />
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
          <p className="font-pixel text-[10px] text-emerald-300 mb-2">PANDUAN RECYCLE</p>
          <div className="grid grid-cols-1 gap-2 text-[11px] text-gray-400 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <PixelIcon type="recycle" className="is-nav" />
              <span><span className="text-emerald-300">Eco Center</span>: Plastik, Kertas, Kaleng, Kaca</span>
            </p>
            <p className="flex items-center gap-2">
              <PixelIcon type="trash" className="is-nav" />
              <span><span className="text-emerald-300">TPS Kota</span>: Organik + semua jenis</span>
            </p>
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            Dekati station lalu tekan E untuk sorting item.
          </p>
        </div>

        <p className="mt-3 text-center font-pixel text-[8px] text-gray-600">
          Tekan I atau ESC untuk menutup
        </p>
      </div>
    </div>
  );
}
