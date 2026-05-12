export const GAME_EVENTS = {
  SYNC_REQUESTED: "ecoquest:game-sync",
  WORLD_CLEANLINESS_CHANGED: "ecoquest:world-cleanliness",
};

export function emitGameEvent(type, detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function onGameEvent(type, handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(type, handler);
  return () => window.removeEventListener(type, handler);
}
