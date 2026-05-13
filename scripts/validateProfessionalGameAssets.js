const fs = require("fs");
const path = require("path");

const root = process.cwd();
const professionalRoot = path.join(root, "public", "assets", "pixel", "professional");
const fallbackRoot = path.join(root, "public", "assets", "pixel", "ecoquest-pro");

const requiredProfessionalFiles = [
  "maps/eco_world.json",
  "tilesets/ecoquest_tiles.png",
  "tilesets/ecoquest_tiles.tsj",
  "characters/hero.png",
  "characters/npcs.png",
  "objects/trash_items.png",
  "objects/stations.png",
  "ui/pixel_ui_tiles.png",
  "ui/panel_dark.png",
  "ui/button_dark.png",
  "audio/ambient_forest.mp3",
  "audio/collect.ogg",
  "audio/ui_click.ogg",
  "audio/recycle.ogg",
  "audio/error.ogg",
  "audio/footstep.ogg",
  "audio/dialog_blip.ogg",
  "audio/ui_hover.ogg",
  "audio/level_up.ogg",
  "tiled/ecoquest.tiled-project",
  "tiled/ecoquest.world",
  "tiled/HANDCRAFTED_MAP_GUIDE.md",
];

const requiredLayers = [
  "ground",
  "grass_detail",
  "paths",
  "shadows",
  "water",
  "buildings",
  "decorations",
  "top_objects",
  "lighting",
  "collision",
  "areas",
  "trash",
  "npcs",
  "stations",
  "ambient",
  "player_spawn",
];

const pngContracts = {
  "tilesets/ecoquest_tiles.png": {
    minWidth: 256,
    minHeight: 320,
    multipleOf: 32,
    label: "main 32x32 tileset",
  },
  "characters/hero.png": {
    frameWidth: 32,
    frameHeight: 32,
    minColumns: 4,
    minRows: 6,
    label: "hero animation sheet",
  },
  "characters/npcs.png": {
    frameWidth: 32,
    frameHeight: 32,
    minColumns: 4,
    minRows: 9,
    label: "NPC animation sheet",
  },
  "objects/trash_items.png": {
    frameWidth: 32,
    frameHeight: 32,
    minColumns: 16,
    minRows: 1,
    label: "trash object sheet",
  },
  "objects/stations.png": {
    frameWidth: 64,
    frameHeight: 64,
    minColumns: 2,
    minRows: 1,
    label: "recycle station sheet",
  },
  "ui/pixel_ui_tiles.png": {
    minWidth: 128,
    minHeight: 64,
    label: "pixel UI tilesheet",
  },
  "ui/panel_dark.png": {
    frameWidth: 32,
    frameHeight: 32,
    minColumns: 1,
    minRows: 1,
    label: "pixel panel tile",
  },
  "ui/button_dark.png": {
    frameWidth: 32,
    frameHeight: 32,
    minColumns: 1,
    minRows: 1,
    label: "pixel button tile",
  },
};

function exists(file) {
  return fs.existsSync(path.join(professionalRoot, file));
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error("not a PNG file");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getObjectLayer(map, name) {
  return (map.layers || []).find((layer) => layer.name === name && layer.type === "objectgroup");
}

function validateMap(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const map = JSON.parse(raw);
  const layerNames = new Set((map.layers || []).map((layer) => layer.name));
  const missingLayers = requiredLayers.filter((layer) => !layerNames.has(layer));
  const errors = [];

  if (missingLayers.length > 0) {
    errors.push(`Missing map layers: ${missingLayers.join(", ")}`);
  }

  if (map.tilewidth !== 32 || map.tileheight !== 32) {
    errors.push(`Expected 32x32 tile size, got ${map.tilewidth}x${map.tileheight}`);
  }

  const tileset = map.tilesets?.[0];
  if (!tileset) {
    errors.push("Map must include at least one tileset");
  } else {
    if (tileset.name !== "ecoquest_tiles") {
      errors.push(`First tileset must be named ecoquest_tiles, got ${tileset.name}`);
    }

    if (!String(tileset.image || "").endsWith("../tilesets/ecoquest_tiles.png")) {
      errors.push(`First tileset image must point to ../tilesets/ecoquest_tiles.png, got ${tileset.image}`);
    }
  }

  const trashLayer = getObjectLayer(map, "trash");
  const npcLayer = getObjectLayer(map, "npcs");
  const stationLayer = getObjectLayer(map, "stations");
  const areaLayer = getObjectLayer(map, "areas");
  const spawnLayer = getObjectLayer(map, "player_spawn");

  if ((trashLayer?.objects || []).length < 10) {
    errors.push("Trash object layer should contain at least 10 pickup objects");
  }

  if ((npcLayer?.objects || []).length < 8) {
    errors.push("NPC object layer should contain at least 8 NPC objects");
  }

  if ((stationLayer?.objects || []).length < 2) {
    errors.push("Station object layer should contain at least Eco Center and TPS");
  }

  if ((areaLayer?.objects || []).length < 8) {
    errors.push("Area object layer should contain at least 8 explorable areas");
  }

  if ((spawnLayer?.objects || []).length < 1) {
    errors.push("player_spawn object layer must contain one spawn point");
  }

  return errors;
}

function validateTiledWorkspace() {
  const errors = [];
  const projectPath = path.join(professionalRoot, "tiled", "ecoquest.tiled-project");
  const worldPath = path.join(professionalRoot, "tiled", "ecoquest.world");
  const tilesetPath = path.join(professionalRoot, "tilesets", "ecoquest_tiles.tsj");
  const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
  const world = JSON.parse(fs.readFileSync(worldPath, "utf8"));
  const tileset = JSON.parse(fs.readFileSync(tilesetPath, "utf8"));

  if (!Array.isArray(project.folders) || !project.folders.includes("..")) {
    errors.push("Tiled project should include the professional asset root folder");
  }

  if (!Array.isArray(world.maps) || world.maps[0]?.fileName !== "../maps/eco_world.json") {
    errors.push("Tiled world should point to ../maps/eco_world.json");
  }

  if (tileset.image !== "ecoquest_tiles.png" || tileset.tilewidth !== 32 || tileset.tileheight !== 32) {
    errors.push("External Tiled tileset should describe ecoquest_tiles.png as 32x32 tiles");
  }

  return errors;
}

function validatePng(file, contract) {
  const filePath = path.join(professionalRoot, file);
  const size = readPngSize(filePath);
  const errors = [];

  if (contract.multipleOf) {
    if (size.width % contract.multipleOf !== 0 || size.height % contract.multipleOf !== 0) {
      errors.push(`${contract.label} dimensions must be multiples of ${contract.multipleOf}, got ${size.width}x${size.height}`);
    }
  }

  if (contract.minWidth && size.width < contract.minWidth) {
    errors.push(`${contract.label} width must be at least ${contract.minWidth}px, got ${size.width}px`);
  }

  if (contract.minHeight && size.height < contract.minHeight) {
    errors.push(`${contract.label} height must be at least ${contract.minHeight}px, got ${size.height}px`);
  }

  if (contract.frameWidth && contract.frameHeight) {
    if (size.width % contract.frameWidth !== 0 || size.height % contract.frameHeight !== 0) {
      errors.push(`${contract.label} must divide cleanly into ${contract.frameWidth}x${contract.frameHeight} frames, got ${size.width}x${size.height}`);
    }

    const columns = Math.floor(size.width / contract.frameWidth);
    const rows = Math.floor(size.height / contract.frameHeight);
    if (columns < contract.minColumns || rows < contract.minRows) {
      errors.push(`${contract.label} needs at least ${contract.minColumns}x${contract.minRows} frames, got ${columns}x${rows}`);
    }
  }

  return errors;
}

const missingFiles = requiredProfessionalFiles.filter((file) => !exists(file));

if (missingFiles.length > 0) {
  console.log("Professional asset pack is not installed yet.");
  console.log("Missing files:");
  missingFiles.forEach((file) => console.log(`- public/assets/pixel/professional/${file}`));
  console.log("");
  console.log(`Current fallback assets remain available at: ${path.relative(root, fallbackRoot)}`);
  process.exit(0);
}

const mapErrors = validateMap(path.join(professionalRoot, "maps", "eco_world.json"));
const tiledWorkspaceErrors = validateTiledWorkspace();
const pngErrors = Object.entries(pngContracts).flatMap(([file, contract]) =>
  validatePng(file, contract).map((error) => `${file}: ${error}`)
);
const audioErrors = [
  ["audio/ambient_forest.mp3", "ID3"],
  ["audio/collect.ogg", "OggS"],
  ["audio/ui_click.ogg", "OggS"],
  ["audio/recycle.ogg", "OggS"],
  ["audio/error.ogg", "OggS"],
  ["audio/footstep.ogg", "OggS"],
  ["audio/dialog_blip.ogg", "OggS"],
  ["audio/ui_hover.ogg", "OggS"],
  ["audio/level_up.ogg", "OggS"],
].flatMap(([file, signature]) => {
  const buffer = fs.readFileSync(path.join(professionalRoot, file));
  const header = buffer.subarray(0, signature.length).toString("ascii");
  return header === signature ? [] : [`${file}: expected ${signature} audio signature`];
});

const errors = [...mapErrors, ...tiledWorkspaceErrors, ...pngErrors, ...audioErrors];
if (errors.length > 0) {
  console.error("Professional asset validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Professional PixelTerra asset pack validation passed.");
