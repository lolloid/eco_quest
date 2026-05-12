const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const mapPath = path.join(root, "public", "assets", "pixel", "professional", "maps", "eco_world.json");

function runNodeScript(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function summarizeMap() {
  if (!fs.existsSync(mapPath)) {
    throw new Error(`Handcrafted map was not generated: ${path.relative(root, mapPath)}`);
  }

  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  const objectCounts = Object.fromEntries(
    map.layers
      .filter((layer) => layer.type === "objectgroup")
      .map((layer) => [layer.name, layer.objects.length])
  );
  const tileDensity = Object.fromEntries(
    map.layers
      .filter((layer) => layer.type === "tilelayer")
      .map((layer) => [layer.name, layer.data.filter(Boolean).length])
  );

  console.log("");
  console.log("EcoQuest handcrafted tilemap generated.");
  console.log(`Map: ${map.width}x${map.height} tiles (${map.width * map.tilewidth}x${map.height * map.tileheight}px)`);
  console.log(`Tile size: ${map.tilewidth}x${map.tileheight}`);
  console.log(`Layers: ${map.layers.length}`);
  console.log("Object layers:");
  Object.entries(objectCounts).forEach(([name, count]) => console.log(`- ${name}: ${count}`));
  console.log("Tile density:");
  Object.entries(tileDensity).forEach(([name, count]) => console.log(`- ${name}: ${count}`));
  console.log("");
  console.log(`Output: ${path.relative(root, mapPath)}`);
}

try {
  runNodeScript(path.join("scripts", "installCc0ProfessionalAssets.js"));
  runNodeScript(path.join("scripts", "validateProfessionalGameAssets.js"));
  summarizeMap();
} catch (error) {
  console.error(`Tilemap generation failed: ${error.message}`);
  process.exit(1);
}
