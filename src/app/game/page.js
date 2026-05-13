"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import dynamic from "next/dynamic";
import Link from "next/link";
import PixelIcon from "@/components/ui/PixelIcon";

const GameWrapper = dynamic(() => import("@/components/game/GameWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100svh-5rem)] min-h-[520px] w-full rounded-xl border border-eco-500/20 bg-[#0a1a12] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center animate-bounce">
          <PixelIcon type="leaf" className="is-large" />
        </div>
        <p className="font-pixel text-xs text-eco-400 animate-pulse">Loading PixelTerra...</p>
        <p className="text-gray-500 text-[10px] mt-2">Mempersiapkan Eco World</p>
      </div>
    </div>
  ),
});

export default function GamePage() {
  const authContext = useAuth();
  const router = useRouter();
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (!authContext?.loading && !authContext?.user) {
      router.push("/login");
    }
  }, [authContext?.user, authContext?.loading, router]);

  if (authContext?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center animate-bounce">
            <PixelIcon type="leaf" className="is-large" />
          </div>
          <p className="font-pixel text-xs text-eco-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authContext?.user) return null;

  return (
    <div className="game-page-shell min-h-[calc(100svh-4rem)] overflow-hidden px-3 py-3">
      <div className="game-page-header mx-auto mb-2 flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PixelIcon type="earth" className="is-large" />
          <div>
            <h1 className="mb-0.5 font-pixel text-sm text-eco-400 sm:text-base">ECO WORLD</h1>
            <p className="text-[11px] text-gray-500">
              Open world eco RPG - WASD/Arrow gerak, E interaksi, R recycle, TAB inventory
            </p>
          </div>
        </div>
        <div className="game-page-actions flex items-center gap-2">
          <button
            onClick={() => setShowControls(!showControls)}
            className="rounded-lg border border-eco-500/30 px-3 py-1.5 text-[11px] text-eco-400 transition-colors hover:bg-eco-500/10 inline-flex items-center gap-2"
          >
            <PixelIcon type="rpg" className="is-nav" />
            {showControls ? "Sembunyikan" : "Kontrol"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-eco-500/30 px-3 py-1.5 text-[11px] text-eco-400 transition-colors hover:bg-eco-500/10 inline-flex items-center gap-2"
          >
            <PixelIcon type="earth" className="is-nav" />
            Dashboard
          </Link>
        </div>
      </div>

      {showControls && (
        <div className="mx-auto mb-2 max-w-7xl rounded-lg border border-eco-500/15 bg-pixel-card/60 p-3 animate-slide-up">
          <div className="grid gap-2 text-[11px] text-gray-400 sm:grid-cols-4">
            <span>
              <strong className="text-eco-300">WASD/Arrow</strong> - Gerak
            </span>
            <span>
              <strong className="text-eco-300">E</strong> - Interaksi / Ambil / Bicara
            </span>
            <span>
              <strong className="text-eco-300">R</strong> - Recycle di station
            </span>
            <span>
              <strong className="text-eco-300">TAB</strong> - Buka Inventory
            </span>
            <span>
              <strong className="text-eco-300">Dekati</strong> NPC/Sampah, lalu tekan E
            </span>
          </div>
        </div>
      )}

      <div className="game-page-stage mx-auto max-w-7xl">
        <GameWrapper
          userId={authContext.user.uid}
          profile={authContext.profile}
        />
      </div>
    </div>
  );
}
