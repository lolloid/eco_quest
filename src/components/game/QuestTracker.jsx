"use client";

import PixelIcon from "@/components/ui/PixelIcon";

export default function QuestTracker({ collectedTrash, totalTrash }) {
  const progress = Math.round((collectedTrash / Math.max(1, totalTrash)) * 100);
  const isComplete = collectedTrash >= totalTrash && totalTrash > 0;
  const title = isComplete ? "Area sudah bersih" : "Kumpulkan dan pilah sampah";

  return (
    <>
      <div className="game-quest-mobile-chip pointer-events-none">
        <PixelIcon type="quest" className="is-tiny" />
        <div>
          <strong>{title}</strong>
          <span>{collectedTrash}/{totalTrash} - {progress}%</span>
        </div>
        <i><b style={{ width: `${progress}%` }} /></i>
      </div>

      <div className="game-quest-panel pointer-events-none absolute left-3 top-[68px] z-20 hidden w-48 xl:block">
        <div className="rounded-lg border border-emerald-400/15 bg-slate-950/80 p-2.5 shadow-xl backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <PixelIcon type="quest" className="is-tiny" />
            <p className="font-pixel text-[8px] text-emerald-200">QUEST AKTIF</p>
          </div>

          <div className="border-t border-white/5 pt-2">
            <p className="text-[11px] leading-tight text-gray-200">{title}</p>

            <div className="mt-1.5 flex items-center gap-2">
              <p className="font-pixel text-[9px] text-gray-400">
                {collectedTrash}/{totalTrash}
              </p>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    isComplete ? "bg-emerald-400" : "bg-gradient-to-r from-amber-400 to-emerald-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {isComplete && (
              <p className="mt-1.5 font-pixel text-[8px] text-emerald-300 animate-pulse">
                +200 Bonus EcoPoints
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
