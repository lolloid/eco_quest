const fs = require("fs");
const path = require("path");

const root = process.cwd();
const professionalRoot = path.join(root, "public", "assets", "pixel", "professional");

const directories = [
  "maps",
  "tilesets",
  "characters",
  "objects",
  "ui",
  "audio",
  "effects",
];

const readme = `# EcoQuest Professional Game Assets

Place licensed professional pixel-art assets in this directory.

Required files:

- maps/eco_world.json
- tilesets/ecoquest_tiles.png
- characters/hero.png
- characters/npcs.png
- objects/trash_items.png
- objects/stations.png

Map contract:

- Tile size: 32 x 32
- First tileset name: ecoquest_tiles
- First tileset image: ../tilesets/ecoquest_tiles.png
- Required layers:
  - ground
  - grass_detail
  - paths
  - shadows
  - water
  - buildings
  - decorations
  - top_objects
  - lighting
  - collision
  - areas
  - trash
  - npcs
  - stations
  - ambient
  - player_spawn

Sprite contracts:

- characters/hero.png: 32x32 frames, at least 4 columns x 6 rows
- characters/npcs.png: 32x32 frames, at least 4 columns x 9 rows
- objects/trash_items.png: 32x32 frames, at least 10 columns x 1 row
- objects/stations.png: 64x64 frames, at least 2 columns x 1 row

Recommended source pack:

- Ninja Adventure Asset Pack, CC0: https://pixel-boy.itch.io/ninja-adventure-asset-pack

After placing assets:

1. Run npm run validate:game-assets
2. Add NEXT_PUBLIC_USE_PROFESSIONAL_GAME_ASSETS=true to .env.local
3. Restart the Next.js dev server
`;

function ensureDir(dir) {
  fs.mkdirSync(path.join(professionalRoot, dir), { recursive: true });
}

directories.forEach(ensureDir);

const readmePath = path.join(professionalRoot, "README.md");
if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, readme);
}

console.log(`Professional asset folders are ready at ${path.relative(root, professionalRoot)}`);
console.log("No placeholder images were generated.");
