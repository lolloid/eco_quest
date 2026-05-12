const fs = require("fs");
const path = require("path");

const root = process.cwd();
const mapPath = path.join(root, "public", "assets", "pixel", "professional", "maps", "eco_world.json");

const T = {
  grass: 1,
  grassBright: 2,
  dirt: 3,
  stone: 4,
  waterA: 7,
  waterB: 8,
  waterEdge: 9,
  bush: 12,
  flowers: 13,
  rock: 14,
  lamp: 20,
  bench: 21,
  sign: 22,
  whiteFence: 25,
  bridge: 26,
  darkGrass: 27,
  grassClump: 33,
  reeds: 35,
  flowerPatch: 36,
  shadowSmall: 37,
  shadowLarge: 38,
  glow: 41,
  riverBank: 44,
  woodFence: 45,
  butterfly: 46,
  fruitTree: 47,
  softShadow: 48,
  dirtA: 49,
  dirtB: 50,
  dirtC: 51,
  dirtD: 52,
};

function findLayer(map, name) {
  const layer = map.layers.find((item) => item.name === name);
  if (!layer) throw new Error(`Missing layer: ${name}`);
  return layer;
}

function idx(width, x, y) {
  return y * width + x;
}

function inBounds(width, height, x, y) {
  return x >= 0 && y >= 0 && x < width && y < height;
}

function set(layer, width, height, x, y, gid) {
  if (inBounds(width, height, x, y)) layer.data[idx(width, x, y)] = gid;
}

function get(layer, width, height, x, y) {
  if (!inBounds(width, height, x, y)) return 0;
  return layer.data[idx(width, x, y)];
}

function fill(layer, width, height, x, y, w, h, gid) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) set(layer, width, height, xx, yy, gid);
  }
}

function put(layer, width, height, coords, gid) {
  coords.forEach(([x, y]) => set(layer, width, height, x, y, gid));
}

function clearLayers(layers, width, height, x, y, w, h) {
  layers.forEach((layer) => fill(layer, width, height, x, y, w, h, 0));
}

function objectTile(object) {
  return {
    x: Math.round((object.x - 16) / 32),
    y: Math.round((object.y - 16) / 32),
  };
}

function setObjectTile(object, x, y) {
  object.x = x * 32 + 16;
  object.y = y * 32 + 16;
}

const trashVariants = [
  ["plastic_bottle", "plastic", "common"],
  ["plastic_bag", "plastic", "common"],
  ["plastic_cup", "plastic", "common"],
  ["plastic_straw", "plastic", "common"],
  ["snack_wrapper", "plastic", "common"],
  ["cardboard", "paper", "common"],
  ["soda_can", "metal", "common"],
  ["used_battery", "electronic", "rare"],
  ["used_mask", "plastic", "uncommon"],
  ["organic_waste", "organic", "common"],
  ["cigarette_butt", "organic", "uncommon"],
  ["glass_bottle", "glass", "uncommon"],
  ["styrofoam", "plastic", "uncommon"],
  ["broken_cable", "electronic", "uncommon"],
  ["broken_electronics", "electronic", "rare"],
  ["scrap_metal", "metal", "rare"],
];

function setProperty(object, name, value) {
  object.properties = object.properties || [];
  const existing = object.properties.find((prop) => prop.name === name);
  if (existing) {
    existing.value = value;
    existing.type = typeof value === "number" ? "int" : "string";
    existing.propertyType = existing.type;
    return;
  }
  object.properties.push({
    name,
    type: typeof value === "number" ? "int" : "string",
    propertyType: typeof value === "number" ? "int" : "string",
    value,
  });
}

function setTrashVariant(object, index) {
  const [variant, trashType, rarity] = trashVariants[index % trashVariants.length];
  object.name = variant;
  setProperty(object, "variant", variant);
  setProperty(object, "trashType", trashType);
  setProperty(object, "rarity", rarity);
}

function addPath(paths, width, height, cells, pathCells) {
  const variants = [T.dirt, T.dirtA, T.dirtB, T.dirtC, T.dirtD];
  cells.forEach(([x, y]) => {
    const gid = variants[Math.abs(x * 7 + y * 11) % variants.length];
    set(paths, width, height, x, y, gid);
    pathCells.add(`${x},${y}`);
  });
}

function pathStroke(points, radius = 1) {
  const cells = [];
  points.forEach(([cx, cy]) => {
    for (let y = cy - radius; y <= cy + radius; y += 1) {
      for (let x = cx - radius; x <= cx + radius; x += 1) {
        if (Math.abs(x - cx) + Math.abs(y - cy) <= radius + 1) cells.push([x, y]);
      }
    }
  });
  return cells;
}

function stampCluster(layer, width, height, cx, cy, pattern, gid) {
  pattern.forEach(([dx, dy]) => set(layer, width, height, cx + dx, cy + dy, gid));
}

function applyVista() {
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  const width = map.width;
  const height = map.height;

  const ground = findLayer(map, "ground");
  const grassDetail = findLayer(map, "grass_detail");
  const paths = findLayer(map, "paths");
  const shadows = findLayer(map, "shadows");
  const water = findLayer(map, "water");
  const decorations = findLayer(map, "decorations");
  const topObjects = findLayer(map, "top_objects");
  const lighting = findLayer(map, "lighting");
  const collision = findLayer(map, "collision");
  const trashLayer = findLayer(map, "trash");
  const npcLayer = findLayer(map, "npcs");
  const stationLayer = findLayer(map, "stations");

  const x0 = 13;
  const y0 = 16;
  const w = 42;
  const h = 25;

  clearLayers([grassDetail, paths, shadows, water, decorations, topObjects, lighting, collision], width, height, x0, y0, w, h);

  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      const hash = Math.abs(x * 31 + y * 17 + (x - y) * 5);
      const gid = hash % 9 === 0 ? T.grassBright : hash % 5 === 0 ? T.darkGrass : T.grass;
      set(ground, width, height, x, y, gid);
      if (hash % 4 === 0) set(grassDetail, width, height, x, y, T.grassClump);
      if (hash % 13 === 0) set(grassDetail, width, height, x, y, T.flowers);
    }
  }

  const pond = [
    [14, 29], [15, 28], [16, 28], [17, 28], [18, 29], [19, 29],
    [14, 30], [15, 30], [16, 30], [17, 30], [18, 30], [19, 30], [20, 30],
    [15, 31], [16, 31], [17, 31], [18, 31], [19, 31],
    [16, 32], [17, 32], [18, 32],
  ];
  pond.forEach(([x, y], i) => {
    set(water, width, height, x, y, i % 2 ? T.waterA : T.waterB);
    set(collision, width, height, x, y, 1);
  });
  const pondEdge = [
    [14, 28], [15, 27], [16, 27], [17, 27], [18, 28], [19, 28], [20, 29],
    [13, 29], [13, 30], [14, 31], [15, 32], [16, 33], [17, 33], [18, 33], [19, 32], [20, 31], [21, 30],
  ];
  put(decorations, width, height, pondEdge, T.riverBank);
  put(grassDetail, width, height, [[14, 32], [15, 33], [20, 28], [21, 29]], T.reeds);

  const pathCells = new Set();
  const mainCurve = [
    [14, 25], [15, 25], [16, 25], [17, 25], [18, 26], [19, 26], [20, 26],
    [21, 27], [22, 27], [23, 27], [24, 28], [25, 28], [26, 28], [27, 29],
    [28, 29], [29, 29], [30, 30], [31, 30], [32, 30], [33, 30], [34, 30],
    [35, 29], [36, 29], [37, 29], [38, 29], [39, 28], [40, 28], [41, 28],
    [42, 28], [43, 28], [44, 29], [45, 29], [46, 29], [47, 29], [48, 29],
    [49, 30], [50, 30], [51, 30], [52, 30],
  ];
  const northBranch = [[31, 18], [31, 19], [31, 20], [31, 21], [31, 22], [30, 23], [30, 24], [30, 25], [30, 26], [30, 27], [31, 28], [31, 29], [31, 30]];
  const southBranch = [[31, 31], [31, 32], [30, 33], [30, 34], [29, 35], [29, 36], [29, 37], [28, 38], [28, 39]];
  addPath(paths, width, height, pathStroke(mainCurve, 1), pathCells);
  addPath(paths, width, height, pathStroke(northBranch, 1), pathCells);
  addPath(paths, width, height, pathStroke(southBranch, 1), pathCells);

  [[22, 28], [23, 28], [24, 28], [22, 29], [23, 29], [24, 29]].forEach(([x, y]) => {
    set(paths, width, height, x, y, T.bridge);
    pathCells.add(`${x},${y}`);
    set(collision, width, height, x, y, 0);
  });

  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      if (!pathCells.has(`${x},${y}`)) continue;
      set(grassDetail, width, height, x, y, 0);
      set(decorations, width, height, x, y, 0);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(width, height, nx, ny) || pathCells.has(`${nx},${ny}`) || get(water, width, height, nx, ny)) return;
        if (!get(grassDetail, width, height, nx, ny)) set(grassDetail, width, height, nx, ny, T.grassClump);
      });
    }
  }

  const pathEdgeCells = new Set();
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      if (pathCells.has(`${x},${y}`) || get(water, width, height, x, y)) continue;
      const touchesPath = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => pathCells.has(`${x + dx},${y + dy}`));
      if (!touchesPath) continue;
      pathEdgeCells.add(`${x},${y}`);
      const hash = Math.abs(x * 13 + y * 19);
      if (hash % 3 === 0) set(grassDetail, width, height, x, y, T.grassClump);
      if (hash % 5 === 0) set(decorations, width, height, x, y, T.flowers);
      if (hash % 7 === 0) set(shadows, width, height, x, y + 1, T.softShadow);
    }
  }

  const decor = {
    [T.fruitTree]: [[15, 18], [17, 19], [21, 20], [39, 19], [43, 20], [48, 22], [52, 23], [16, 35], [19, 36], [44, 37], [51, 36]],
    [T.bush]: [[15, 22], [16, 22], [19, 22], [23, 24], [27, 24], [37, 24], [41, 24], [47, 25], [51, 25], [18, 33], [25, 34], [35, 35], [40, 36], [50, 35]],
    [T.flowerPatch]: [[18, 23], [21, 23], [25, 23], [30, 22], [34, 24], [39, 23], [45, 24], [49, 24], [27, 32], [33, 32], [36, 32], [43, 32], [47, 33], [52, 34], [22, 37]],
    [T.rock]: [[20, 24], [28, 23], [38, 25], [46, 24], [50, 27], [24, 36], [33, 37], [46, 35], [53, 32]],
    [T.lamp]: [[28, 27], [36, 27], [29, 33], [42, 31], [18, 26], [50, 29], [33, 25], [45, 32]],
    [T.bench]: [[24, 26], [26, 26], [38, 31], [45, 27], [21, 34], [48, 33]],
    [T.sign]: [[29, 26], [41, 27], [32, 34], [50, 31], [20, 32], [53, 28]],
    [T.butterfly]: [[23, 22], [35, 23], [44, 23], [27, 35], [37, 34], [48, 34], [52, 26]],
  };

  Object.entries(decor).forEach(([gid, coords]) => {
    coords.forEach(([x, y]) => {
      if (pathCells.has(`${x},${y}`) || get(water, width, height, x, y)) return;
      set(decorations, width, height, x, y, Number(gid));
      if (Number(gid) !== T.butterfly && Number(gid) !== T.flowerPatch) {
        set(shadows, width, height, x, y + 1, Number(gid) === T.fruitTree ? T.shadowLarge : T.shadowSmall);
      }
    });
  });

  put(topObjects, width, height, [[17, 27], [18, 27], [19, 27], [20, 27], [41, 35], [42, 35], [43, 35], [44, 35], [45, 35]], T.woodFence);
  put(topObjects, width, height, [[47, 26], [48, 26], [49, 26], [50, 26], [51, 26]], T.whiteFence);

  [
    [22, 21], [23, 21], [24, 21], [25, 21],
    [22, 22], [25, 22], [22, 23], [25, 23],
    [46, 20], [47, 20], [48, 20], [49, 20],
    [46, 21], [49, 21], [46, 22], [49, 22],
  ].forEach(([x, y]) => {
    if (!pathCells.has(`${x},${y}`)) set(topObjects, width, height, x, y, T.woodFence);
  });

  [
    [17, 21], [18, 21], [19, 21], [20, 21],
    [43, 22], [44, 22], [45, 22],
    [18, 37], [19, 37], [20, 37],
    [49, 36], [50, 36], [51, 36],
  ].forEach(([x, y]) => {
    stampCluster(grassDetail, width, height, x, y, [[0, 0], [1, 0], [0, 1]], T.flowerPatch);
    set(decorations, width, height, x + 1, y + 1, T.bush);
    set(shadows, width, height, x + 1, y + 2, T.shadowSmall);
  });

  [[24, 25], [31, 30], [38, 28], [45, 30], [28, 35], [37, 34], [50, 29], [19, 25], [33, 24], [42, 33]].forEach(([x, y]) => {
    set(lighting, width, height, x, y, T.glow);
  });

  const spawnTrashCoords = [
    // Dirty pond and river edge: plastic, glass, organic waste.
    [18, 29], [20, 30], [16, 32], [21, 31],
    // Roadside litter: snack wrappers, cans, masks.
    [27, 27], [31, 29], [36, 29], [44, 28],
    // Recycle/NPC plaza: visible tutorial pickups near interaction zones.
    [33, 24], [35, 24], [42, 33], [45, 35],
    // Town and industry edge: electronic/metal waste.
    [49, 29], [52, 31], [50, 35], [23, 35],
  ];

  trashLayer.objects.forEach((object, index) => {
    setTrashVariant(object, index);
    setProperty(object, "areaId", index < spawnTrashCoords.length ? "taman_kota" : (object.properties?.find((prop) => prop.name === "areaId")?.value || "taman_kota"));
  });

  trashLayer.objects.slice(0, spawnTrashCoords.length).forEach((object, index) => {
    const coords = spawnTrashCoords[index];
    if (!coords) return;
    setObjectTile(object, coords[0], coords[1]);
    set(lighting, width, height, coords[0], coords[1], T.glow);
    set(shadows, width, height, coords[0], coords[1] + 1, T.shadowSmall);
  });

  npcLayer.objects.slice(0, 4).forEach((object, index) => {
    const coords = [[34, 31], [42, 27], [34, 32], [22, 34]][index];
    if (!coords) return;
    setObjectTile(object, coords[0], coords[1]);
    set(lighting, width, height, coords[0], coords[1], T.glow);
    set(shadows, width, height, coords[0], coords[1] + 1, T.shadowSmall);
  });

  const ecologicalClusters = [
    {
      name: "pond reeds",
      tiles: [[13, 28], [14, 27], [15, 33], [19, 33], [21, 29], [22, 30]],
      gid: T.reeds,
    },
    {
      name: "roadside flowers",
      tiles: [[26, 25], [29, 25], [33, 26], [39, 26], [46, 26], [51, 28], [27, 32], [35, 32], [43, 31]],
      gid: T.flowerPatch,
    },
    {
      name: "town bushes",
      tiles: [[40, 23], [44, 24], [48, 24], [52, 25], [49, 33], [53, 34], [46, 36]],
      gid: T.bush,
      shadow: T.shadowSmall,
    },
    {
      name: "forest rocks",
      tiles: [[15, 24], [18, 24], [20, 23], [23, 24], [18, 36], [23, 37], [28, 37]],
      gid: T.rock,
      shadow: T.shadowSmall,
    },
    {
      name: "meadow butterflies",
      tiles: [[25, 22], [32, 23], [37, 22], [43, 23], [47, 34], [52, 27]],
      gid: T.butterfly,
    },
  ];

  ecologicalClusters.forEach((cluster) => {
    cluster.tiles.forEach(([x, y]) => {
      if (pathCells.has(`${x},${y}`) || get(water, width, height, x, y) || get(collision, width, height, x, y)) return;
      if (get(topObjects, width, height, x, y)) return;
      set(cluster.gid === T.reeds || cluster.gid === T.flowerPatch ? grassDetail : decorations, width, height, x, y, cluster.gid);
      if (cluster.shadow) set(shadows, width, height, x, y + 1, cluster.shadow);
    });
  });

  stationLayer.objects.forEach((object, index) => {
    const tile = objectTile(object);
    put(lighting, width, height, [[tile.x, tile.y], [tile.x + 1, tile.y], [tile.x, tile.y + 1]], T.glow);
    set(shadows, width, height, tile.x, tile.y + 1, T.shadowLarge);
    const signX = Math.max(1, Math.min(width - 2, tile.x + (index % 2 === 0 ? 2 : -2)));
    const signY = Math.max(1, Math.min(height - 2, tile.y - 1));
    if (!get(paths, width, height, signX, signY) && !get(water, width, height, signX, signY)) {
      set(decorations, width, height, signX, signY, T.sign);
      set(shadows, width, height, signX, signY + 1, T.shadowSmall);
    }
  });

  const spawnLayer = findLayer(map, "player_spawn");
  if (spawnLayer.objects?.[0]) setObjectTile(spawnLayer.objects[0], 31, 30);

  map.properties = [
    ...(map.properties || []).filter((prop) => prop.name !== "spawnVistaPass"),
    {
      name: "spawnVistaPass",
      type: "string",
      value: "handcrafted_spawn_plaza_v1",
    },
  ];

  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
}

applyVista();
console.log("Handcrafted spawn vista applied.");
