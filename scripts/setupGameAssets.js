/**
 * setupGameAssets.js — Copies generated assets and builds the tilemap
 * Run: node scripts/setupGameAssets.js
 */
const fs = require("fs");
const path = require("path");

const BRAIN_DIR = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".gemini", "antigravity", "brain", "387a6e2d-881f-4283-b186-fe4e87e7b397"
);

const ASSETS_DIR = path.join(__dirname, "..", "public", "assets", "pixel", "ecoquest-pro");

const copyMap = {
  "ecoquest_tileset": path.join(ASSETS_DIR, "tilesets", "ecoquest_tiles.png"),
  "ecoquest_trash_sprites": path.join(ASSETS_DIR, "sprites", "trash_items.png"),
  "ecoquest_npc_sprites": path.join(ASSETS_DIR, "sprites", "npcs.png"),
  "ecoquest_stations": path.join(ASSETS_DIR, "sprites", "stations.png"),
  "ecoquest_animals": path.join(ASSETS_DIR, "sprites", "animals.png"),
};

let copied = 0;

if (fs.existsSync(BRAIN_DIR)) {
  const files = fs.readdirSync(BRAIN_DIR);
  Object.entries(copyMap).forEach(([prefix, dest]) => {
    const match = files.find((f) => f.startsWith(prefix) && f.endsWith(".png"));
    if (match) {
      const src = path.join(BRAIN_DIR, match);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied: ${match} → ${path.relative(process.cwd(), dest)}`);
      copied++;
    } else {
      console.log(`⚠️  Not found: ${prefix}*.png`);
    }
  });
} else {
  console.log("⚠️  Brain directory not found, skipping asset copy");
}

console.log(`\n📦 Copied ${copied}/${Object.keys(copyMap).length} assets`);

// Now generate tilemap
console.log("\n🗺️  Generating tilemap...");
require("./generateTilemap.js");
