const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "src/app/api/game/events/route.js",
  "src/server/rewards/rewardEngine.js",
  "src/server/quests/questEngine.js",
  "src/app/api/quests/claim/route.js",
  "src/app/api/articles/quiz/route.js",
  "src/app/api/npcs/route.js",
  "src/app/api/admin/summary/route.js",
  "src/app/api/admin/quests/route.js",
  "src/app/api/admin/articles/route.js",
  "src/app/api/admin/npcs/route.js",
  "src/app/api/admin/quizzes/route.js",
  "src/app/api/inventory/route.js",
  "src/app/api/world/route.js",
  "src/app/api/recycle/route.js",
  "src/features/game/ecoWorldData.js",
  "src/features/game/events/gameEventBus.js",
  "src/features/game/config/professionalAssetManifest.js",
  "src/features/game/config/resolveGameAssets.js",
  "src/server/auth/requireAdmin.js",
  "scripts/generateEcoPixelAssets.js",
  "scripts/scaffoldProfessionalGameAssets.js",
  "scripts/importProfessionalAssetPack.js",
  "scripts/installCc0ProfessionalAssets.js",
  "scripts/validateProfessionalGameAssets.js",
  "public/assets/pixel/ecoquest-pro/maps/eco_world.json",
  "public/assets/pixel/ecoquest-pro/tilesets/ecoquest_tiles.png",
  "public/assets/pixel/ecoquest-pro/sprites/trash_items.png",
  "public/assets/pixel/ecoquest-pro/sprites/npcs.png",
  "public/assets/pixel/professional/ui/pixel_ui_tiles.png",
  "public/assets/pixel/professional/ui/panel_dark.png",
  "public/assets/pixel/professional/ui/button_dark.png",
  "public/assets/pixel/professional/audio/ambient_forest.mp3",
  "public/assets/pixel/professional/audio/collect.ogg",
  "public/assets/pixel/professional/audio/ui_click.ogg",
  "public/assets/pixel/professional/audio/recycle.ogg",
  "public/assets/pixel/professional/audio/error.ogg",
  "public/assets/pixel/professional/audio/footstep.ogg",
  "public/assets/pixel/professional/audio/dialog_blip.ogg",
  "public/assets/pixel/professional/audio/ui_hover.ogg",
  "public/assets/pixel/professional/audio/level_up.ogg",
  "public/assets/pixel/professional/tilesets/ecoquest_tiles.tsj",
  "public/assets/pixel/professional/tiled/ecoquest.tiled-project",
  "public/assets/pixel/professional/tiled/ecoquest.world",
  "public/assets/pixel/professional/tiled/HANDCRAFTED_MAP_GUIDE.md",
  "firebase.json",
  "firestore.indexes.json",
  "scripts/seedArchitecture.js",
  "firestore.rules",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error("Missing required architecture files:");
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

const rewardEngine = fs.readFileSync(path.join(root, "src/server/rewards/rewardEngine.js"), "utf8");
const gameWrapper = fs.readFileSync(path.join(root, "src/components/game/GameWrapper.jsx"), "utf8");
const bootScene = fs.readFileSync(path.join(root, "src/game/scenes/BootScene.js"), "utf8");
const worldScene = fs.readFileSync(path.join(root, "src/game/scenes/EcoWorldScene.js"), "utf8");
const npcManager = fs.readFileSync(path.join(root, "src/game/systems/NPCManager.js"), "utf8");
const assetManifest = fs.readFileSync(path.join(root, "src/game/config/AssetManifest.js"), "utf8");
const adminQuestsRoute = fs.readFileSync(path.join(root, "src/app/api/admin/quests/route.js"), "utf8");
const adminArticlesRoute = fs.readFileSync(path.join(root, "src/app/api/admin/articles/route.js"), "utf8");

const checks = [
  ["Reward engine uses transactions", rewardEngine.includes("runTransaction")],
  ["Reward engine prepares quest reads before writes", rewardEngine.includes("prepareQuestProgressForEvent")],
  ["Reward engine writes quest progress", rewardEngine.includes("writeQuestProgressForEvent")],
  ["Reward engine prepares achievement reads before writes", rewardEngine.includes("prepareAchievementsForEvent")],
  ["Reward engine writes achievements", rewardEngine.includes("writeAchievementsForEvent")],
  ["Game uses event API", gameWrapper.includes("/api/game/events")],
  ["Game does not call deprecated quest API", !gameWrapper.includes("/api/quest")],
  ["Game uses Phaser tilemap", bootScene.includes("tilemapTiledJSON") && worldScene.includes("createLayer")],
  ["Game loads professional audio", assetManifest.includes("ambient_forest") && assetManifest.includes("sfx_collect")],
  ["Game loads NPCs from tilemap object layer", npcManager.includes('getObjectLayer("npcs")')],
  ["Game uses world status API", gameWrapper.includes("/api/world")],
  ["Admin quests support delete", adminQuestsRoute.includes("export async function DELETE")],
  ["Admin articles support delete", adminArticlesRoute.includes("export async function DELETE")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length > 0) {
  console.error("Architecture smoke checks failed:");
  failed.forEach(([label]) => console.error(`- ${label}`));
  process.exit(1);
}

console.log("PixelTerra architecture smoke checks passed.");
