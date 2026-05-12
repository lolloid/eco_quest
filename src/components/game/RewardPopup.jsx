"use client";

/**
 * RewardPopup - Floating reward/penalty notification.
 */

import PixelIcon from "@/components/ui/PixelIcon";

export default function RewardPopup({ popup }) {
  if (!popup) return null;

  const isReward = popup.type === "reward";
  const isInfo = popup.type === "info";

  return (
    <div
      className={`game-reward-popup pointer-events-none absolute left-1/2 top-[35%] z-30 -translate-x-1/2 animate-slide-up px-5 py-3 font-pixel text-[10px] ${
        isReward ? "is-reward text-emerald-100" : isInfo ? "text-cyan-100" : "is-penalty text-red-100"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <PixelIcon type={isReward || isInfo ? "spark" : "shield"} className="is-tiny" />
        {popup.text}
      </span>
    </div>
  );
}
