/**
 * AssetManifest — All game asset paths and frame specifications
 *
 * Uses the PROFESSIONAL asset pack (Kenney CC0 sources).
 * See /public/assets/pixel/professional/README.md for contracts.
 */

const BASE = "/assets/pixel/professional";
const VISUAL_VERSION = "readability-v8";

export const ASSET_KEYS = {
  // Tilemaps
  MAP: "eco_world",

  // Tilesets
  TILES: "ecoquest_tiles",

  // Spritesheets
  HERO: "hero",
  NPCS: "npc_sheet",
  TRASH: "trash_items",
  STATIONS: "stations",
  ANIMALS: "animals",

  // Audio
  AMBIENT: "ambient_forest",
  SFX_COLLECT: "sfx_collect",
  SFX_INTERACT: "sfx_interact",
  SFX_RECYCLE: "sfx_recycle",
  SFX_ERROR: "sfx_error",
  SFX_FOOTSTEP: "sfx_footstep",
  SFX_DIALOG: "sfx_dialog_blip",
  SFX_LEVEL_UP: "sfx_level_up",
};

export const ASSET_PATHS = {
  // Map
  map: `${BASE}/maps/eco_world.json?v=${VISUAL_VERSION}`,

  // Tilesets
  tiles: `${BASE}/tilesets/ecoquest_tiles.png?v=${VISUAL_VERSION}`,

  // Spritesheets — use professional assets
  hero: `${BASE}/characters/hero.png`,
  npcs: `${BASE}/characters/npcs.png`,
  trash: `${BASE}/objects/trash_items.png?v=${VISUAL_VERSION}`,
  stations: `${BASE}/objects/stations.png?v=${VISUAL_VERSION}`,
  animals: `${BASE}/characters/npcs.png`, // re-use NPC sheet row 8+ as animals until dedicated sheet exists

  // Audio — Kenney + OpenGameArt CC0
  audio: {
    ambient: `${BASE}/audio/ambient_forest.mp3`,
    collect: `${BASE}/audio/collect.ogg`,
    interact: `${BASE}/audio/ui_click.ogg`,
    recycle: `${BASE}/audio/recycle.ogg`,
    error: `${BASE}/audio/error.ogg`,
    footstep: `${BASE}/audio/footstep.ogg`,
    dialogBlip: `${BASE}/audio/dialog_blip.ogg`,
    levelUp: `${BASE}/audio/level_up.ogg`,
  },
};

// Per the professional README:
// hero.png:    32×32 frames, 4 columns × 6 rows (24 frames)
// npcs.png:    32×32 frames, 4 columns × 9 rows (36 frames)
// trash.png:   32x32 frames, 16 columns x 1 row
// stations.png: 64×64 frames, 2 columns × 1 row
export const SPRITESHEET_CONFIG = {
  hero: { frameWidth: 32, frameHeight: 32 },
  npcs: { frameWidth: 32, frameHeight: 32 },
  trash: { frameWidth: 32, frameHeight: 32 },
  stations: { frameWidth: 64, frameHeight: 64 },
  animals: { frameWidth: 32, frameHeight: 32 },
};

export const TILESET_CONFIG = {
  name: "ecoquest_tiles",
  tileWidth: 32,
  tileHeight: 32,
};
