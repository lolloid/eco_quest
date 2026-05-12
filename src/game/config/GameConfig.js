/**
 * GameConfig — Central game configuration constants
 *
 * Matches the professional tilemap: 80×50 tiles at 32×32 px.
 */

export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

export const TILE_SIZE = 32;
export const MAP_COLS = 80;
export const MAP_ROWS = 50;
export const MAP_WIDTH = MAP_COLS * TILE_SIZE;   // 2560
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE;  // 1600

export const PLAYER_SPEED = 160;
export const NPC_WANDER_SPEED = 30;
export const NPC_WANDER_INTERVAL = 2200;
export const ANIMAL_WANDER_INTERVAL = 2800;

export const INTERACTION_RADIUS = 78;
export const CAMERA_LERP = 0.12;
export const CAMERA_ZOOM = 1.5;

export const INVENTORY_CAPACITY = 40;

export const DEPTH = {
  GROUND: 0,
  PATHS: 1,
  WATER: 2,
  SHADOWS: 3,
  FLOOR_DECOR: 4,
  BUILDINGS: 10,
  WALL_DECOR: 11,
  OBJECTS: 12,
  TRASH: 15,
  STATIONS: 18,
  NPC: 20,
  PLAYER: 25,
  ABOVE_PLAYER: 30,
  PARTICLES: 35,
  UI: 40,
};

export const COLORS = {
  BG: "#0a1a12",
  CLEAN_TINT: 0xffffff,
  DIRTY_TINT: 0xc9c28f,
  CLEAN_WATER: 0xd6ffff,
  DIRTY_WATER: 0x96b8a8,
};
