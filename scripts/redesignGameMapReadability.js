const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = process.cwd();
const assetRoot = path.join(root, "public", "assets", "pixel", "professional");
const mapPath = path.join(assetRoot, "maps", "eco_world.json");
const tilesetPath = path.join(assetRoot, "tilesets", "ecoquest_tiles.png");
const trashPath = path.join(assetRoot, "objects", "trash_items.png");
const tilesetBasePath = path.join(assetRoot, "tilesets", "ecoquest_tiles.readability-base.png");
const trashBasePath = path.join(assetRoot, "objects", "trash_items.readability-base.png");

const TILE = 32;
const TILE_COLS = 8;

const T = {
  grass: 1,
  grassBright: 2,
  dirt: 3,
  stone: 4,
  city: 5,
  sand: 6,
  waterA: 7,
  waterB: 8,
  waterEdge: 9,
  treeA: 10,
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

function ensureExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required asset: ${path.relative(root, filePath)}`);
  }
}

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function readChunks(buffer) {
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += length + 12;
    if (type === "IEND") break;
  }
  return chunks;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${filePath} is not a PNG file`);
  }

  const chunks = readChunks(buffer);
  const ihdr = chunks.find((item) => item.type === "IHDR").data;
  const plte = chunks.find((item) => item.type === "PLTE")?.data || null;
  const trns = chunks.find((item) => item.type === "tRNS")?.data || null;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  const interlace = ihdr[12];

  if (bitDepth !== 8 || interlace !== 0) {
    throw new Error("Only 8-bit non-interlaced PNG files are supported");
  }

  const idat = Buffer.concat(chunks.filter((item) => item.type === "IDAT").map((item) => item.data));
  const inflated = zlib.inflateSync(idat);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 0 || colorType === 3 ? 1 : 0;
  if (!channels) throw new Error(`Unsupported PNG color type: ${colorType}`);
  if (colorType === 3 && !plte) throw new Error("Palette PNG is missing PLTE chunk");

  const stride = width * channels;
  const raw = Buffer.alloc(stride * height);
  let inputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const rowOffset = y * stride;
    const prevRowOffset = (y - 1) * stride;
    for (let x = 0; x < stride; x += 1) {
      const value = inflated[inputOffset];
      inputOffset += 1;
      const left = x >= channels ? raw[rowOffset + x - channels] : 0;
      const up = y > 0 ? raw[prevRowOffset + x] : 0;
      const upLeft = y > 0 && x >= channels ? raw[prevRowOffset + x - channels] : 0;
      if (filter === 0) raw[rowOffset + x] = value;
      if (filter === 1) raw[rowOffset + x] = (value + left) & 255;
      if (filter === 2) raw[rowOffset + x] = (value + up) & 255;
      if (filter === 3) raw[rowOffset + x] = (value + Math.floor((left + up) / 2)) & 255;
      if (filter === 4) raw[rowOffset + x] = (value + paeth(left, up, upLeft)) & 255;
    }
  }

  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < raw.length; i += channels, j += 4) {
    if (colorType === 3) {
      const paletteIndex = raw[i];
      const paletteOffset = paletteIndex * 3;
      pixels[j] = plte[paletteOffset] || 0;
      pixels[j + 1] = plte[paletteOffset + 1] || 0;
      pixels[j + 2] = plte[paletteOffset + 2] || 0;
      pixels[j + 3] = trns && paletteIndex < trns.length ? trns[paletteIndex] : 255;
    } else {
      pixels[j] = raw[i];
      pixels[j + 1] = channels >= 3 ? raw[i + 1] : raw[i];
      pixels[j + 2] = channels >= 3 ? raw[i + 2] : raw[i];
      pixels[j + 3] = channels === 4 ? raw[i + 3] : channels === 2 ? raw[i + 1] : 255;
    }
  }

  return { width, height, pixels };
}

function writePng(filePath, width, height, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(pixels.buffer, pixels.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  fs.writeFileSync(
    filePath,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", header),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ])
  );
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function pixelIndex(image, x, y) {
  return (y * image.width + x) * 4;
}

function gradeTile(image, gid, { multiply = [1, 1, 1], add = [0, 0, 0], contrast = 1 } = {}) {
  const index = gid - 1;
  const x0 = (index % TILE_COLS) * TILE;
  const y0 = Math.floor(index / TILE_COLS) * TILE;
  for (let y = y0; y < y0 + TILE; y += 1) {
    for (let x = x0; x < x0 + TILE; x += 1) {
      const i = pixelIndex(image, x, y);
      if (image.pixels[i + 3] === 0) continue;
      image.pixels[i] = clamp(((image.pixels[i] - 128) * contrast + 128) * multiply[0] + add[0]);
      image.pixels[i + 1] = clamp(((image.pixels[i + 1] - 128) * contrast + 128) * multiply[1] + add[1]);
      image.pixels[i + 2] = clamp(((image.pixels[i + 2] - 128) * contrast + 128) * multiply[2] + add[2]);
    }
  }
}

function blendPixel(image, x, y, color, alpha) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const i = pixelIndex(image, x, y);
  if (image.pixels[i + 3] === 0) return;
  const inv = 1 - alpha;
  image.pixels[i] = clamp(((color >> 16) & 255) * alpha + image.pixels[i] * inv);
  image.pixels[i + 1] = clamp(((color >> 8) & 255) * alpha + image.pixels[i + 1] * inv);
  image.pixels[i + 2] = clamp((color & 255) * alpha + image.pixels[i + 2] * inv);
}

function addTileTexture(image, gid, colors, stride = 5) {
  const index = gid - 1;
  const x0 = (index % TILE_COLS) * TILE;
  const y0 = Math.floor(index / TILE_COLS) * TILE;
  for (let y = 2; y < TILE - 2; y += stride) {
    for (let x = 1; x < TILE - 2; x += stride) {
      const hash = (x * 31 + y * 17 + gid * 13) % colors.length;
      blendPixel(image, x0 + x, y0 + y, colors[hash], 0.38);
      if ((x + y + gid) % 3 === 0) blendPixel(image, x0 + x + 1, y0 + y, colors[hash], 0.25);
    }
  }
}

function addTileEdgeContrast(image, gid, color, alpha = 0.26) {
  const index = gid - 1;
  const x0 = (index % TILE_COLS) * TILE;
  const y0 = Math.floor(index / TILE_COLS) * TILE;
  for (let x = 0; x < TILE; x += 1) {
    blendPixel(image, x0 + x, y0, color, alpha);
    blendPixel(image, x0 + x, y0 + TILE - 1, color, alpha);
  }
  for (let y = 0; y < TILE; y += 1) {
    blendPixel(image, x0, y0 + y, color, alpha);
    blendPixel(image, x0 + TILE - 1, y0 + y, color, alpha);
  }
}

function paintTile(image, gid, baseColor, detailColors = []) {
  const index = gid - 1;
  const x0 = (index % TILE_COLS) * TILE;
  const y0 = Math.floor(index / TILE_COLS) * TILE;
  for (let y = 0; y < TILE; y += 1) {
    for (let x = 0; x < TILE; x += 1) {
      const i = pixelIndex(image, x0 + x, y0 + y);
      image.pixels[i] = (baseColor >> 16) & 255;
      image.pixels[i + 1] = (baseColor >> 8) & 255;
      image.pixels[i + 2] = baseColor & 255;
      image.pixels[i + 3] = 255;
    }
  }

  detailColors.forEach((color, detailIndex) => {
    const step = 4 + detailIndex;
    for (let y = 1 + detailIndex; y < TILE - 1; y += step) {
      for (let x = (detailIndex * 3) % 5; x < TILE - 1; x += step) {
        const length = 1 + ((x + y + gid) % 3);
        for (let n = 0; n < length; n += 1) blendPixel(image, x0 + x + n, y0 + y, color, 0.5);
      }
    }
  });
}

function drawTileRect(image, gid, x, y, w, h, color, alpha = 1) {
  const index = gid - 1;
  const x0 = (index % TILE_COLS) * TILE;
  const y0 = Math.floor(index / TILE_COLS) * TILE;
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      blendPixel(image, x0 + xx, y0 + yy, color, alpha);
    }
  }
}

function paintReadableCoreTiles(image) {
  paintTile(image, T.grass, 0x1f6b38, [0x2e8a45, 0x164f2d, 0x5fbf5c]);
  paintTile(image, T.grassBright, 0x2d7e3e, [0x48a653, 0x1e6232, 0x86d66b]);
  paintTile(image, T.darkGrass, 0x124625, [0x1e6534, 0x0b2e1a, 0x377d3f]);

  paintTile(image, T.dirt, 0xb9864f, [0xe0b06b, 0x7a5031, 0xc99a5f]);
  for (let y = 5; y < TILE; y += 8) {
    drawTileRect(image, T.dirt, 5 + ((y * 3) % 7), y, 10 + (y % 5), 1, 0x7a5031, 0.16);
  }
  [
    [T.dirtA, 0xb17c49, [0xdba567, 0x7a4d2d, 0xc4915b]],
    [T.dirtB, 0xc08a52, [0xe7b66f, 0x835432, 0xa96f41]],
    [T.dirtC, 0xa87545, [0xd0965c, 0x6f472b, 0xc59a63]],
    [T.dirtD, 0xb98254, [0xefbe7b, 0x765033, 0x9f6840]],
  ].forEach(([gid, base, colors], variantIndex) => {
    paintTile(image, gid, base, colors);
    for (let y = 4 + variantIndex; y < TILE; y += 9) {
      drawTileRect(image, gid, 3 + ((y + gid) % 11), y, 8 + ((gid + y) % 8), 1, 0x654126, 0.14);
    }
  });

  paintTile(image, T.stone, 0x74706a, [0xa8a29e, 0x4b5563, 0xd6d3d1]);
  for (let y = 6; y < TILE; y += 8) drawTileRect(image, T.stone, 0, y, TILE, 1, 0x3f3f46, 0.28);
  for (let x = 7; x < TILE; x += 10) drawTileRect(image, T.stone, x, 1, 1, TILE - 2, 0x3f3f46, 0.2);

  paintTile(image, T.city, 0x384252, [0x64748b, 0x1f2937, 0x94a3b8]);
  drawTileRect(image, T.city, 0, 0, TILE, 2, 0x0f172a, 0.35);
  drawTileRect(image, T.city, 0, TILE - 2, TILE, 2, 0x0f172a, 0.35);

  paintTile(image, T.sand, 0xcaa96b, [0xf3d28b, 0x9b7347, 0xe7c178]);
  paintTile(image, T.bridge, 0x8b5f35, [0xb77a42, 0x4b2f1e, 0xd19a5c]);
  for (let x = 6; x < TILE; x += 10) drawTileRect(image, T.bridge, x, 0, 2, TILE, 0x3a2418, 0.42);

  paintTile(image, T.waterA, 0x0e7490, [0x67e8f9, 0x155e75, 0x22d3ee]);
  paintTile(image, T.waterB, 0x0891b2, [0xa5f3fc, 0x164e63, 0x38bdf8]);
}

function improveTileset() {
  if (!fs.existsSync(tilesetBasePath)) fs.copyFileSync(tilesetPath, tilesetBasePath);
  const image = decodePng(tilesetBasePath);

  paintReadableCoreTiles(image);

  [T.grass, T.grassBright, T.darkGrass].forEach((gid) => {
    gradeTile(image, gid, { multiply: [0.62, 0.86, 0.68], add: [-18, -2, -18], contrast: 1.12 });
    addTileTexture(image, gid, [0x173a23, 0x2f6b3a, 0x67b957, 0x0f2619], gid === T.grassBright ? 4 : 5);
  });

  [T.dirt, T.stone, T.bridge, T.sand, T.city].forEach((gid) => {
    gradeTile(image, gid, { multiply: [1.12, 1.04, 0.9], add: [20, 12, -8], contrast: 1.16 });
    addTileTexture(image, gid, [0xf2c47a, 0x7b5230, 0xd39b58, 0x5a3b24], 6);
    addTileEdgeContrast(image, gid, 0x3a2418, gid === T.dirt ? 0.08 : 0.06);
  });

  [T.waterA, T.waterB, 30].forEach((gid) => {
    gradeTile(image, gid, { multiply: [0.72, 1.05, 1.24], add: [-20, 10, 28], contrast: 1.1 });
    addTileTexture(image, gid, [0x7dd3fc, 0x0891b2, 0x164e63], 7);
  });

  [T.bush, T.treeA, T.fruitTree, 42].forEach((gid) => {
    gradeTile(image, gid, { multiply: [0.72, 0.96, 0.7], add: [-16, 8, -16], contrast: 1.18 });
  });

  writePng(tilesetPath, image.width, image.height, image.pixels);
}

function outlineSprites(filePath, basePath, frameWidth, outlineColor = 0x031118) {
  if (!fs.existsSync(basePath)) fs.copyFileSync(filePath, basePath);
  const image = decodePng(basePath);
  const source = new Uint8Array(image.pixels);
  const frameCount = Math.floor(image.width / frameWidth);
  for (let frame = 0; frame < frameCount; frame += 1) {
    const x0 = frame * frameWidth;
    for (let y = 0; y < image.height; y += 1) {
      for (let x = x0; x < x0 + frameWidth; x += 1) {
        const i = pixelIndex(image, x, y);
        if (source[i + 3] !== 0) continue;
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
          [x - 1, y - 1],
          [x + 1, y + 1],
        ];
        const touchesSolid = neighbors.some(([nx, ny]) => {
          if (nx < x0 || nx >= x0 + frameWidth || ny < 0 || ny >= image.height) return false;
          return source[pixelIndex(image, nx, ny) + 3] > 80;
        });
        if (!touchesSolid) continue;
        image.pixels[i] = (outlineColor >> 16) & 255;
        image.pixels[i + 1] = (outlineColor >> 8) & 255;
        image.pixels[i + 2] = outlineColor & 255;
        image.pixels[i + 3] = 235;
      }
    }
  }
  writePng(filePath, image.width, image.height, image.pixels);
}

function findLayer(map, name) {
  const layer = map.layers.find((item) => item.name === name);
  if (!layer) throw new Error(`Missing map layer: ${name}`);
  return layer;
}

function idx(width, x, y) {
  return y * width + x;
}

function inBounds(width, height, x, y) {
  return x >= 0 && y >= 0 && x < width && y < height;
}

function setTile(layer, width, height, x, y, gid) {
  if (inBounds(width, height, x, y)) layer.data[idx(width, x, y)] = gid;
}

function getTile(layer, width, height, x, y) {
  if (!inBounds(width, height, x, y)) return 0;
  return layer.data[idx(width, x, y)];
}

function fillRect(layer, width, height, x, y, w, h, gid) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setTile(layer, width, height, xx, yy, gid);
  }
}

function putList(layer, width, height, coords, gid) {
  coords.forEach(([x, y]) => setTile(layer, width, height, x, y, gid));
}

function objectProp(object, name, fallback = null) {
  return object.properties?.find((prop) => prop.name === name)?.value ?? fallback;
}

function objectTile(object) {
  return {
    x: Math.round((object.x - 16) / TILE),
    y: Math.round((object.y - 16) / TILE),
  };
}

function setObjectTile(object, tx, ty) {
  object.x = tx * TILE + 16;
  object.y = ty * TILE + 16;
}

function improveTilemap() {
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

  paths.data.fill(0);

  const pathCells = new Set();
  const addPath = (x, y, w, h, gid = T.dirt) => {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        const pathGid = gid === T.dirt
          ? [T.dirt, T.dirtA, T.dirtB, T.dirtC, T.dirtD][Math.abs(xx * 11 + yy * 17) % 5]
          : gid;
        setTile(paths, width, height, xx, yy, pathGid);
        pathCells.add(`${xx},${yy}`);
      }
    }
  };

  addPath(28, 0, 3, 18);
  addPath(25, 16, 23, 3);
  addPath(23, 24, 49, 3);
  addPath(63, 27, 3, 10);
  addPath(57, 37, 22, 3, T.stone);
  addPath(22, 29, 3, 12);
  addPath(11, 42, 3, 8);
  addPath(50, 13, 9, 3);
  addPath(9, 23, 16, 3);
  addPath(37, 32, 23, 3);
  addPath(46, 19, 3, 16);
  addPath(4, 45, 20, 3);

  [
    [24, 29], [24, 30], [24, 31], [25, 29], [25, 30], [25, 31],
    [26, 29], [26, 30], [26, 31], [27, 29], [27, 30], [27, 31],
  ].forEach(([x, y]) => {
    setTile(paths, width, height, x, y, T.bridge);
    pathCells.add(`${x},${y}`);
    setTile(collision, width, height, x, y, 0);
  });

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if (!pathCells.has(`${x},${y}`)) continue;
      for (let yy = y - 1; yy <= y + 1; yy += 1) {
        for (let xx = x - 1; xx <= x + 1; xx += 1) {
          if (!inBounds(width, height, xx, yy)) continue;
          if (pathCells.has(`${xx},${yy}`)) {
            setTile(grassDetail, width, height, xx, yy, 0);
            setTile(decorations, width, height, xx, yy, 0);
          }
        }
      }
    }
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if (!pathCells.has(`${x},${y}`)) continue;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(width, height, nx, ny)) return;
        if (pathCells.has(`${nx},${ny}`) || getTile(water, width, height, nx, ny)) return;
        if (getTile(collision, width, height, nx, ny)) return;
        const marker = dy === 1 ? T.shadowSmall : T.grassClump;
        if (!getTile(decorations, width, height, nx, ny)) setTile(grassDetail, width, height, nx, ny, marker);
      });
    }
  }

  const grassVariation = [
    [33, 9], [38, 8], [42, 10], [52, 8], [56, 10], [13, 16], [18, 16],
    [33, 21], [37, 22], [40, 24], [51, 23], [54, 25], [69, 22],
    [30, 36], [34, 37], [39, 38], [46, 37], [51, 36], [68, 41], [73, 42],
  ];
  putList(grassDetail, width, height, grassVariation, T.grassClump);

  const flowers = [
    [12, 20], [15, 21], [19, 20], [34, 14], [37, 14], [42, 15], [54, 18],
    [60, 18], [66, 19], [71, 21], [30, 28], [36, 29], [42, 29], [52, 29],
    [59, 32], [67, 32], [72, 34], [31, 41], [37, 42], [44, 41], [52, 42],
  ];
  putList(grassDetail, width, height, flowers, T.flowerPatch);

  const readableDecorations = {
    [T.sign]: [[26, 18], [49, 25], [61, 36], [20, 39], [12, 43], [56, 13]],
    [T.lamp]: [[25, 17], [32, 18], [44, 24], [58, 35], [70, 35], [12, 46], [22, 34]],
    [T.bench]: [[15, 24], [38, 28], [50, 30], [64, 35], [71, 35]],
    [T.bush]: [[10, 21], [18, 22], [34, 22], [41, 23], [54, 22], [69, 24], [76, 29], [29, 39], [45, 40]],
    [T.rock]: [[6, 24], [21, 22], [36, 25], [51, 26], [60, 31], [73, 31], [18, 45]],
    [T.reeds]: [[33, 12], [38, 12], [42, 14], [2, 29], [8, 29], [15, 29], [22, 30], [29, 31]],
    [T.butterfly]: [[14, 18], [31, 15], [52, 17], [66, 23], [41, 30], [55, 31], [72, 28], [36, 40]],
  };

  Object.entries(readableDecorations).forEach(([gid, coords]) => {
    coords.forEach(([x, y]) => {
      if (pathCells.has(`${x},${y}`) || getTile(collision, width, height, x, y)) return;
      setTile(decorations, width, height, x, y, Number(gid));
      if (Number(gid) !== T.butterfly) setTile(shadows, width, height, x, y + 1, T.shadowSmall);
    });
  });

  putList(topObjects, width, height, [[54, 35], [55, 35], [56, 35], [72, 35], [73, 35], [74, 35]], T.whiteFence);
  putList(topObjects, width, height, [[6, 23], [7, 23], [8, 23], [19, 23], [20, 23], [21, 23], [47, 22], [48, 22], [49, 22], [50, 22]], T.woodFence);

  const trashTiles = [
    [8, 24], [14, 23], [20, 26], [27, 23], [18, 27], [10, 26],
    [57, 30], [63, 32], [68, 30], [74, 33], [70, 28], [60, 34],
    [6, 7], [10, 11], [15, 9], [19, 13], [4, 13], [17, 6],
    [7, 36], [13, 38], [19, 37], [23, 40], [31, 36], [39, 39],
    [48, 37], [56, 40], [66, 38], [5, 28], [11, 29], [16, 30],
    [22, 28], [26, 32], [39, 23], [43, 25], [50, 27], [55, 24],
    [51, 31], [54, 38], [60, 41], [66, 39], [72, 41], [76, 38],
    [28, 7], [35, 12], [31, 17], [5, 45], [15, 46], [20, 48],
  ];

  trashLayer.objects.forEach((object, index) => {
    const tile = trashTiles[index] || objectTile(object);
    setObjectTile(object, tile[0], tile[1]);
    setTile(lighting, width, height, tile[0], tile[1], T.glow);
    setTile(shadows, width, height, tile[0], tile[1] + 1, T.shadowSmall);
    setTile(grassDetail, width, height, tile[0], tile[1], 0);
    setTile(decorations, width, height, tile[0], tile[1], 0);
  });

  npcLayer.objects.forEach((object) => {
    const tile = objectTile(object);
    setTile(lighting, width, height, tile.x, tile.y, T.glow);
    setTile(shadows, width, height, tile.x, tile.y + 1, T.shadowSmall);
    if (!pathCells.has(`${tile.x},${tile.y}`)) {
      setTile(grassDetail, width, height, tile.x, tile.y, 0);
      setTile(decorations, width, height, tile.x, tile.y, 0);
    }
  });

  stationLayer.objects.forEach((object) => {
    const tile = objectTile(object);
    setTile(lighting, width, height, tile.x, tile.y, T.glow);
    setTile(lighting, width, height, tile.x + 1, tile.y, T.glow);
    setTile(shadows, width, height, tile.x, tile.y + 1, T.shadowLarge);
  });

  map.properties = [
    ...(map.properties || []).filter((prop) => prop.name !== "readabilityPass"),
    {
      name: "readabilityPass",
      type: "string",
      value: "roads_clearer_trash_highlighted_depth_added_v2",
    },
  ];

  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
}

ensureExists(mapPath);
ensureExists(tilesetPath);
ensureExists(trashPath);

improveTileset();
outlineSprites(trashPath, trashBasePath, 32);
improveTilemap();

console.log("EcoQuest game map readability redesign applied.");
console.log("- Roads widened and separated from grass");
console.log("- Trash/NPC/station tiles highlighted with glow and shadows");
console.log("- Grass/path/water tilesets recolored for stronger contrast");
console.log("- Trash sprites outlined for better gameplay readability");
