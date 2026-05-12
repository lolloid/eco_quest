"use client";

import { clamp } from "@/game/config/WorldData";
import PixelIcon from "@/components/ui/PixelIcon";

export default function GameHUD({
  profile,
  score,
  trashLeft,
  currentCleanliness,
  currentArea,
  inventoryCount,
  onOpenInventory,
}) {
  const status = trashLeft === 0 ? "BERSIH" : "PROSES";
  const cleanPct = clamp(currentCleanliness, 0, 100);
  const rawXP = Number(profile?.currentXP ?? profile?.xp ?? 10);
  const xpPercent = clamp(Math.round(rawXP > 100 ? rawXP % 100 : rawXP), 0, 100);

  return (
    <div className="game-hud-root pointer-events-none absolute left-3 right-3 top-3 z-20 flex flex-wrap items-start gap-2">
      <div className="game-mobile-status-hud pointer-events-auto">
        <div className="game-mobile-xp">
          <span>XP</span>
          <i><b style={{ width: `${xpPercent}%` }} /></i>
          <em>{xpPercent}%</em>
        </div>
        <div className="game-mobile-stat">
          <span>EP</span>
          <b>{score || 0}</b>
        </div>
        <div className="game-mobile-stat">
          <span>Trash</span>
          <b>{trashLeft}</b>
        </div>
        <div className="game-mobile-stat is-clean">
          <span>Clean</span>
          <b>{cleanPct}%</b>
        </div>
      </div>

      <div className="game-hud-panel game-hud-desktop pointer-events-auto px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <PixelIcon type="warrior" className="is-nav" />
          <div>
            <p className="font-pixel text-[10px] text-white leading-tight">
              {profile?.displayName || "EcoWarrior"}
            </p>
            <p className="font-pixel text-[8px] text-emerald-300 mt-0.5">
              Lv.{profile?.level || 1} - {score || 0} EP
            </p>
          </div>
        </div>
      </div>

      <div className="game-hud-panel game-hud-desktop pointer-events-auto px-3 py-2.5">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-pixel text-[8px] text-gray-400">SAMPAH</p>
            <p className="font-pixel text-sm text-orange-300">{trashLeft}</p>
          </div>
          <div>
            <p className="font-pixel text-[8px] text-gray-400">STATUS</p>
            <p className="font-pixel text-sm text-emerald-300">{status}</p>
          </div>
          <div className="hidden sm:block">
            <p className="font-pixel text-[8px] text-gray-400">SKOR</p>
            <p className="font-pixel text-sm text-amber-200">{score}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-lime-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${cleanPct}%` }}
            />
          </div>
          <span className="font-pixel text-[8px] text-gray-400">{cleanPct}%</span>
        </div>
      </div>

      <div className="game-hud-panel game-hud-desktop px-3 py-2.5">
        <p className="font-pixel text-[8px] text-gray-400">AREA</p>
        <p className="font-pixel text-[10px] text-emerald-200 mt-0.5">{currentArea}</p>
      </div>

      <button
        onClick={onOpenInventory}
        className="game-hud-panel game-hud-desktop pointer-events-auto ml-auto hidden px-3 py-2.5 transition-colors hover:border-emerald-400/50 lg:block"
      >
        <p className="font-pixel text-[8px] text-gray-400">INVENTORY</p>
        <p className="font-pixel text-[10px] text-emerald-200 mt-0.5 flex items-center gap-2">
          <PixelIcon type="trash" className="is-nav" />
          {inventoryCount}/40
        </p>
      </button>
    </div>
  );
}
