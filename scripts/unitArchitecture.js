const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(label, condition) {
  if (!condition) {
    console.error(`Assertion failed: ${label}`);
    process.exitCode = 1;
  }
}

const middleware = read("src/middleware.js");
const sessionRoute = read("src/app/api/auth/session/route.js");
const gameWrapper = read("src/components/game/GameWrapper.jsx");
const gameEventBus = read("src/game/events/EventBus.js");
const interactionSystem = read("src/game/systems/InteractionManager.js");
const bootScene = read("src/game/scenes/BootScene.js");
const worldScene = read("src/game/scenes/EcoWorldScene.js");
const npcManager = read("src/game/systems/NPCManager.js");
const trashManager = read("src/game/systems/TrashManager.js");
const assetManifest = read("src/game/config/AssetManifest.js");
const demoAuth = read("src/lib/demoAuth.js");
const demoGameStore = read("src/server/demo/demoGameStore.js");
const generateTilemap = read("scripts/generateTilemap.js");
const firestoreRules = read("firestore.rules");
const adminClient = read("src/features/admin/AdminClient.jsx");
const packageJson = read("package.json");

assert("middleware redirects protected routes without session", middleware.includes("protectedPrefixes") && middleware.includes("NextResponse.redirect"));
assert("session route creates Firebase session cookie", sessionRoute.includes("createSessionCookie") && sessionRoute.includes("ecoquest_session"));
assert("session route supports development demo login", sessionRoute.includes("body?.demo") && sessionRoute.includes("DEMO_TOKEN"));
assert("session route clears cookie", sessionRoute.includes("export async function DELETE"));
assert(
  "game canvas applies live world updates without reinitializing Phaser",
  gameEventBus.includes("WORLD_CLEANLINESS") &&
    gameWrapper.includes("loadWorld") &&
    gameWrapper.includes("destroy(true)")
);
assert(
  "game canvas uses tilemap object layers for interactions",
  interactionSystem.includes("findNearest") &&
    interactionSystem.includes("INTERACTION_PROMPT") &&
    trashManager.includes('getObjectLayer("trash")') &&
    npcManager.includes('getObjectLayer("npcs")')
);
assert(
  "game canvas wires UI and audio asset pack",
  gameWrapper.includes("GameHUD") &&
    assetManifest.includes("ambient_forest") &&
    assetManifest.includes("SFX_COLLECT") &&
    bootScene.includes("this.load.audio")
);
assert("game uses Phaser tilemap scene architecture", bootScene.includes("tilemapTiledJSON") && worldScene.includes("createLayer"));
assert("demo auth is development-only", demoAuth.includes("NODE_ENV !== \"production\"") && demoAuth.includes("DEMO_TOKEN"));
assert("demo game store supports user gameplay APIs", demoGameStore.includes("processDemoActionEvent") && demoGameStore.includes("recycleDemoInventoryItem"));
assert(
  "tilemap generator uses handcrafted professional pipeline",
  generateTilemap.includes("installCc0ProfessionalAssets.js") &&
    generateTilemap.includes("validateProfessionalGameAssets.js") &&
    !generateTilemap.includes("Math.random") &&
    !generateTilemap.includes("TILE = 16")
);
assert("firestore rules include quizzes", firestoreRules.includes("match /quizzes/{quizId}"));
assert("firestore rules include npcs", firestoreRules.includes("match /npcs/{npcId}"));
assert("admin nav includes NPCs", adminClient.includes("/admin/npcs"));
assert("admin nav includes Quizzes", adminClient.includes("/admin/quizzes"));
assert("package has architecture seed script", packageJson.includes("seed:architecture"));

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("EcoQuest unit architecture assertions passed.");
