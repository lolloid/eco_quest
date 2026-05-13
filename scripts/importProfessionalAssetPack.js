const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const professionalRoot = path.join(root, "public", "assets", "pixel", "professional");
const defaultManifestPath = path.join(professionalRoot, "import-manifest.json");

const slotTargets = {
  map: "maps/eco_world.json",
  tiles: "tilesets/ecoquest_tiles.png",
  hero: "characters/hero.png",
  npcs: "characters/npcs.png",
  trash: "objects/trash_items.png",
  stations: "objects/stations.png",
  uiTiles: "ui/pixel_ui_tiles.png",
  uiPanel: "ui/panel_dark.png",
  uiButton: "ui/button_dark.png",
  ambientAudio: "audio/ambient_forest.mp3",
  collectAudio: "audio/collect.ogg",
  interactAudio: "audio/ui_click.ogg",
  recycleAudio: "audio/recycle.ogg",
  errorAudio: "audio/error.ogg",
  footstepAudio: "audio/footstep.ogg",
  dialogBlipAudio: "audio/dialog_blip.ogg",
  uiHoverAudio: "audio/ui_hover.ogg",
  levelUpAudio: "audio/level_up.ogg",
};

function parseArgs(argv) {
  const args = {
    source: "",
    manifest: defaultManifestPath,
    force: false,
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    if (arg === "--force") args.force = true;
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--source") {
      args.source = argv[index + 1] || "";
      index += 1;
    }
    if (arg === "--manifest") {
      args.manifest = argv[index + 1] || "";
      index += 1;
    }
  }

  return args;
}

function printHelp() {
  console.log(`PixelTerra professional asset importer

Usage:
  npm run import:professional-assets -- --source "C:/path/to/asset-pack"

Options:
  --source <dir>      Extracted asset pack folder.
  --manifest <file>   Import manifest JSON. Default: public/assets/pixel/professional/import-manifest.json
  --force             Overwrite existing imported files.
  --dry-run           Show planned copy operations without writing files.
  --help              Show this help.

Manifest format:
{
  "files": {
    "map": "maps/eco_world.json",
    "tiles": "tilesets/ecoquest_tiles.png",
    "hero": "characters/hero.png",
    "npcs": "characters/npcs.png",
    "trash": "objects/trash_items.png",
    "stations": "objects/stations.png",
    "uiTiles": "ui/pixel_ui_tiles.png",
    "uiPanel": "ui/panel_dark.png",
    "uiButton": "ui/button_dark.png",
    "ambientAudio": "audio/ambient_forest.mp3",
    "collectAudio": "audio/collect.ogg",
    "interactAudio": "audio/ui_click.ogg",
    "recycleAudio": "audio/recycle.ogg",
    "errorAudio": "audio/error.ogg",
    "footstepAudio": "audio/footstep.ogg",
    "dialogBlipAudio": "audio/dialog_blip.ogg",
    "uiHoverAudio": "audio/ui_hover.ogg",
    "levelUpAudio": "audio/level_up.ogg"
  }
}
`);
}

function ensureInside(parent, child, label) {
  const parentPath = path.resolve(parent);
  const childPath = path.resolve(child);
  if (childPath !== parentPath && !childPath.startsWith(`${parentPath}${path.sep}`)) {
    throw new Error(`${label} escapes allowed directory: ${child}`);
  }
  return childPath;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!manifest.files || typeof manifest.files !== "object") {
    throw new Error("Manifest must contain a files object");
  }

  const missingSlots = Object.keys(slotTargets).filter((slot) => !manifest.files[slot]);
  if (missingSlots.length > 0) {
    throw new Error(`Manifest missing file slots: ${missingSlots.join(", ")}`);
  }

  return manifest;
}

function normalizeTiledMap(mapPath) {
  const raw = fs.readFileSync(mapPath, "utf8");
  const map = JSON.parse(raw);

  if (!Array.isArray(map.tilesets) || map.tilesets.length === 0) {
    throw new Error("Imported map must include at least one tileset");
  }

  map.tilewidth = 32;
  map.tileheight = 32;
  map.tilesets[0] = {
    ...map.tilesets[0],
    firstgid: 1,
    name: "ecoquest_tiles",
    image: "../tilesets/ecoquest_tiles.png",
    tilewidth: 32,
    tileheight: 32,
  };

  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
}

function copySlot({ sourceRoot, manifest, slot, force, dryRun }) {
  const sourceRelative = manifest.files[slot];
  const targetRelative = slotTargets[slot];
  const sourcePath = ensureInside(sourceRoot, path.join(sourceRoot, sourceRelative), "Source file");
  const targetPath = ensureInside(professionalRoot, path.join(professionalRoot, targetRelative), "Target file");

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file for ${slot} does not exist: ${sourcePath}`);
  }

  if (fs.existsSync(targetPath) && !force) {
    throw new Error(`Target already exists for ${slot}: ${targetPath}. Re-run with --force to overwrite.`);
  }

  console.log(`${dryRun ? "Would copy" : "Copying"} ${path.relative(sourceRoot, sourcePath)} -> ${path.relative(root, targetPath)}`);
  if (!dryRun) {
    ensureDir(targetPath);
    fs.copyFileSync(sourcePath, targetPath);
    if (slot === "map") normalizeTiledMap(targetPath);
  }
}

function runValidator() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(command, ["run", "validate:game-assets"], {
    cwd: root,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (!args.source) {
  printHelp();
  process.exit(1);
}

try {
  const sourceRoot = path.resolve(args.source);
  if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
    throw new Error(`Source directory does not exist: ${sourceRoot}`);
  }

  const manifestPath = path.resolve(args.manifest || defaultManifestPath);
  const manifest = readManifest(manifestPath);

  Object.keys(slotTargets).forEach((slot) => {
    copySlot({
      sourceRoot,
      manifest,
      slot,
      force: args.force,
      dryRun: args.dryRun,
    });
  });

  if (!args.dryRun) {
    runValidator();
  }

  console.log("Professional asset import completed.");
} catch (error) {
  console.error(`Professional asset import failed: ${error.message}`);
  process.exit(1);
}
