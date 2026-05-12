"use client";

/**
 * MiniMapOverlay — Small map showing player position and area layout
 *
 * Uses MAP_WIDTH / MAP_HEIGHT from GameConfig (must match actual tilemap).
 */

import { MAP_WIDTH, MAP_HEIGHT } from "@/game/config/GameConfig";

export default function MiniMapOverlay({ playerPosition, currentArea }) {
  const playerPctX = Math.min(100, Math.max(0, (playerPosition.x / MAP_WIDTH) * 100));
  const playerPctY = Math.min(100, Math.max(0, (playerPosition.y / MAP_HEIGHT) * 100));

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 hidden xl:block">
      <div className="rounded-lg border border-emerald-400/20 bg-slate-950/85 p-2 shadow-xl backdrop-blur-sm">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-pixel text-[8px] text-emerald-200">PETA</p>
          {currentArea && (
            <p className="font-pixel text-[6px] text-emerald-400/70 truncate max-w-[80px]">
              {currentArea}
            </p>
          )}
        </div>

        {/* Map Container */}
        <div className="relative h-[90px] w-[140px] overflow-hidden rounded-md border border-emerald-400/15 bg-[#1a3a25]">
          {/* Area blocks — approximate visual layout of the professional tilemap */}
          <AreaBlock name="Hutan" color="#1a5c1a" x={0} y={0} w={35} h={30} />
          <AreaBlock name="Danau" color="#2980b9" x={35} y={0} w={30} h={25} />
          <AreaBlock name="Camping" color="#6d5c3a" x={65} y={0} w={35} h={25} />
          <AreaBlock name="Kebun" color="#66a832" x={0} y={30} w={30} h={25} />
          <AreaBlock name="Taman" color="#3a6b32" x={30} y={25} w={35} h={25} />
          <AreaBlock name="Kota" color="#8b7355" x={65} y={25} w={35} h={25} />
          <AreaBlock name="Sekolah" color="#4a6fa5" x={0} y={55} w={30} h={20} />
          <AreaBlock name="Sungai" color="#3498db" x={30} y={50} w={40} h={15} />
          <AreaBlock name="Pantai" color="#f0d78c" x={70} y={50} w={30} h={25} />
          <AreaBlock name="Recycle" color="#2ecc71" x={0} y={75} w={35} h={25} />
          <AreaBlock name="Industri" color="#7f8c8d" x={35} y={65} w={35} h={35} />

          {/* Player dot */}
          <span
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100 bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.75)]"
            style={{
              left: `${playerPctX}%`,
              top: `${playerPctY}%`,
            }}
          />

          {/* Pulse ring */}
          <span
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cyan-300/25"
            style={{
              left: `${playerPctX}%`,
              top: `${playerPctY}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AreaBlock({ name, color, x, y, w, h }) {
  return (
    <div
      className="absolute flex items-center justify-center border border-black/10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        backgroundColor: color + "66",
      }}
    >
      <span className="text-[5px] text-white/50 font-pixel select-none">
        {name}
      </span>
    </div>
  );
}
