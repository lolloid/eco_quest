"use client";

import { useEffect, useState } from "react";

export default function InteractionPrompt({ prompt }) {
  const [isTouchUI, setIsTouchUI] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 900px), (pointer: coarse)");
    const sync = () => setIsTouchUI(Boolean(query?.matches));
    sync();
    query?.addEventListener?.("change", sync);
    return () => query?.removeEventListener?.("change", sync);
  }, []);

  if (!prompt) return null;

  return (
    <div className="game-interaction-prompt pointer-events-none absolute bottom-28 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 px-4 py-2.5 animate-slide-up">
      <span className="game-interaction-key flex h-7 min-w-7 items-center justify-center px-1 font-pixel text-[9px]">
        {isTouchUI ? "TAP" : prompt.key}
      </span>
      <span className="text-sm text-white">{prompt.text}</span>
    </div>
  );
}
