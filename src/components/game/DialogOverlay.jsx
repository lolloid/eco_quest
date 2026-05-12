"use client";

/**
 * DialogOverlay - JRPG-style dialog box with typewriter effect.
 */

import { useState, useEffect } from "react";
import PixelIcon from "@/components/ui/PixelIcon";

export default function DialogOverlay({ dialog, onClose, onAccept }) {
  const [typedText, setTypedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!dialog?.message) {
      setTypedText("");
      setIsComplete(false);
      return;
    }

    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedText(dialog.message.slice(0, index));
      if (index >= dialog.message.length) {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [dialog?.message]);

  if (!dialog) return null;

  return (
    <div className="game-dialog-shell absolute inset-x-3 bottom-3 z-30 animate-slide-up md:inset-x-6">
      <div className="game-dialog-panel p-4 md:p-5">
        <div className="flex gap-4">
          <div className="game-dialog-portrait flex h-20 w-20 shrink-0 items-center justify-center md:h-24 md:w-24">
            <span className="grid place-items-center gap-1 text-center">
              <PixelIcon type="user" className="is-large" />
              <span className="font-pixel text-[7px] text-emerald-100">
                {dialog.role || "NPC"}
              </span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-pixel text-sm text-amber-100 md:text-base">
                {dialog.name}
              </h3>
              <span className="game-dialog-role px-2 py-0.5 text-[10px]">
                {dialog.role}
              </span>
            </div>

            <p className="min-h-[48px] text-sm leading-6 text-gray-100 md:text-base md:leading-7">
              {typedText}
              {!isComplete && (
                <span className="inline-block w-2 animate-pulse text-emerald-400">|</span>
              )}
            </p>

            {dialog.quest && isComplete && (
              <div className="game-dialog-quest mt-2 px-3 py-2">
                <p className="flex items-center gap-2 font-pixel text-[10px] text-amber-200">
                  <PixelIcon type="quest" className="is-tiny" />
                  {dialog.quest.title}
                </p>
                <p className="mt-0.5 text-[10px] text-amber-300/70">
                  Reward: +{dialog.quest.reward} EcoPoints
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="game-dialog-actions mt-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-300 transition-colors hover:text-white"
          >
            {dialog.quest ? "Nanti" : "Tutup"}
          </button>
          {dialog.quest && (
            <button
              onClick={onAccept}
              className="px-4 py-2 font-pixel text-[10px] text-emerald-100 transition-colors"
            >
              Terima Quest
            </button>
          )}
          {!dialog.quest && (
            <button
              onClick={onClose}
              className="px-4 py-2 font-pixel text-[10px] text-emerald-100 transition-colors"
            >
              Lanjut
            </button>
          )}
        </div>
      </div>

      {isComplete && (
        <div className="mt-1 text-center">
          <span className="font-pixel text-[8px] text-gray-500 animate-pulse">v</span>
        </div>
      )}
    </div>
  );
}
