const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = process.cwd();
const professionalRoot = path.join(root, "public", "assets", "pixel", "professional");
const fallbackRoot = path.join(root, "public", "assets", "pixel", "ecoquest-pro");
const kenneyRoot = path.join(professionalRoot, "_downloads", "kenney_rpg_urban");
const sourceTilesPath = path.join(kenneyRoot, "Tilemap", "tilemap_packed.png");
const uiPackRoot = path.join(professionalRoot, "_downloads", "kenney_ui_pack_pixel_adventure");
const interfaceSoundsRoot = path.join(professionalRoot, "_downloads", "kenney_interface_sounds");
const forestAmbiencePath = path.join(professionalRoot, "_downloads", "Forest_Ambience.mp3");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, width, height, pixels) {
  ensureDir(filePath);
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

function readChunks(buffer) {
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 12 + length;
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

  const bpp = channels;
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
      const left = x >= bpp ? raw[rowOffset + x - bpp] : 0;
      const up = y > 0 ? raw[prevRowOffset + x] : 0;
      const upLeft = y > 0 && x >= bpp ? raw[prevRowOffset + x - bpp] : 0;

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

function makeCanvas(width, height) {
  return { width, height, pixels: new Uint8Array(width * height * 4) };
}

function blitScaled({ source, target, sx, sy, sw, sh, dx, dy, scale = 1 }) {
  for (let y = 0; y < sh; y += 1) {
    for (let x = 0; x < sw; x += 1) {
      const sourceIndex = ((sy + y) * source.width + sx + x) * 4;
      const alpha = source.pixels[sourceIndex + 3];
      for (let yy = 0; yy < scale; yy += 1) {
        for (let xx = 0; xx < scale; xx += 1) {
          const tx = dx + x * scale + xx;
          const ty = dy + y * scale + yy;
          if (tx < 0 || ty < 0 || tx >= target.width || ty >= target.height) continue;
          const targetIndex = (ty * target.width + tx) * 4;
          target.pixels[targetIndex] = source.pixels[sourceIndex];
          target.pixels[targetIndex + 1] = source.pixels[sourceIndex + 1];
          target.pixels[targetIndex + 2] = source.pixels[sourceIndex + 2];
          target.pixels[targetIndex + 3] = alpha;
        }
      }
    }
  }
}

function drawRect(target, x, y, width, height, color, alpha = 255) {
  for (let yy = 0; yy < height; yy += 1) {
    for (let xx = 0; xx < width; xx += 1) {
      const tx = x + xx;
      const ty = y + yy;
      if (tx < 0 || ty < 0 || tx >= target.width || ty >= target.height) continue;
      const index = (ty * target.width + tx) * 4;
      const sourceAlpha = alpha / 255;
      const inverseAlpha = 1 - sourceAlpha;
      target.pixels[index] = Math.round(((color >> 16) & 255) * sourceAlpha + target.pixels[index] * inverseAlpha);
      target.pixels[index + 1] = Math.round(((color >> 8) & 255) * sourceAlpha + target.pixels[index + 1] * inverseAlpha);
      target.pixels[index + 2] = Math.round((color & 255) * sourceAlpha + target.pixels[index + 2] * inverseAlpha);
      target.pixels[index + 3] = Math.max(target.pixels[index + 3], alpha);
    }
  }
}

function decorateHeroFrame(target, frameIndex, variant) {
  const x = (frameIndex % 4) * 32;
  const y = Math.floor(frameIndex / 4) * 32;
  drawRect(target, x + 9, y + 17, 14, 8, 0x16a34a, 210);
  drawRect(target, x + 10, y + 19, 12, 3, 0x86efac, 235);
  drawRect(target, x + 7, y + 14, 4, 9, 0x0f5132, 230);
  drawRect(target, x + 21, y + 14, 4, 9, 0x0f5132, 230);
  drawRect(target, x + 6, y + 20, 4, 6, 0x334155, 230);
  drawRect(target, x + 22, y + 20, 4, 6, 0x334155, 230);
  drawRect(target, x + 11, y + 5, 10, 3, 0x0f172a, 190);
  drawRect(target, x + 12, y + 8, 8, 1, 0x34d399, 230);
  if (variant === "collect") {
    drawRect(target, x + 22, y + 10, 6, 3, 0xfacc15, 240);
    drawRect(target, x + 25, y + 7, 2, 8, 0xfef08a, 220);
  }
  if (variant === "interact") {
    drawRect(target, x + 23, y + 8, 3, 3, 0xffffff, 240);
    drawRect(target, x + 24, y + 5, 1, 2, 0xffffff, 220);
  }
}

function decorateNpcFrame(target, frameIndex, roleIndex) {
  const x = (frameIndex % 4) * 32;
  const y = Math.floor(frameIndex / 4) * 32;
  const palettes = [
    [0xe5e7eb, 0x22c55e], [0xf59e0b, 0x38bdf8], [0x166534, 0x92400e],
    [0x0ea5e9, 0xf97316], [0xec4899, 0xfacc15], [0x365314, 0x84cc16],
    [0x64748b, 0x22c55e], [0xb45309, 0x60a5fa], [0x7c3aed, 0x2dd4bf],
  ];
  const [main, accent] = palettes[roleIndex % palettes.length];
  drawRect(target, x + 9, y + 18, 14, 8, main, 215);
  drawRect(target, x + 11, y + 20, 10, 2, accent, 235);
  if (roleIndex === 0) {
    drawRect(target, x + 9, y + 10, 14, 2, 0xffffff, 240);
    drawRect(target, x + 11, y + 11, 3, 3, 0x111827, 220);
    drawRect(target, x + 18, y + 11, 3, 3, 0x111827, 220);
  }
  if (roleIndex === 1) drawRect(target, x + 8, y + 5, 16, 3, 0xfacc15, 240);
  if (roleIndex === 2) drawRect(target, x + 7, y + 6, 18, 4, 0x166534, 240);
  if (roleIndex === 3) drawRect(target, x + 6, y + 20, 20, 3, 0x0f172a, 190);
  if (roleIndex === 6) drawRect(target, x + 6, y + 10, 20, 2, 0xf8fafc, 240);
  if (roleIndex === 8) drawRect(target, x + 8, y + 8, 16, 2, 0x2dd4bf, 240);
}

function blitTile(source, target, sourceCol, sourceRow, targetGid) {
  const index = targetGid - 1;
  const dx = (index % 8) * 32;
  const dy = Math.floor(index / 8) * 32;
  blitScaled({
    source,
    target,
    sx: sourceCol * 16,
    sy: sourceRow * 16,
    sw: 16,
    sh: 16,
    dx,
    dy,
    scale: 2,
  });
}

function buildTileset(source) {
  const target = makeCanvas(256, 320);
  const map = {
    1: [0, 0], 2: [1, 0], 3: [0, 4], 4: [1, 4], 5: [0, 12], 6: [3, 1], 7: [6, 4], 8: [7, 4],
    9: [6, 5], 10: [18, 7], 11: [19, 7], 12: [17, 8], 13: [10, 10], 14: [2, 9], 15: [7, 0], 16: [7, 1],
    17: [12, 10], 18: [13, 10], 19: [4, 13], 20: [1, 7], 21: [9, 7], 22: [14, 9], 23: [14, 10], 24: [15, 8],
    25: [2, 14], 26: [4, 0], 27: [5, 0], 28: [8, 0], 29: [6, 4], 30: [6, 5], 31: [15, 10], 32: [16, 10],
    33: [1, 1], 34: [2, 1], 35: [17, 8], 36: [10, 10], 37: [20, 9], 38: [21, 9], 39: [4, 13], 40: [26, 17],
    41: [1, 8], 42: [18, 6], 43: [6, 6], 44: [7, 6], 45: [5, 13], 46: [24, 0], 47: [17, 9], 48: [20, 10],
  };

  Object.entries(map).forEach(([gid, coords]) => {
    blitTile(source, target, coords[0], coords[1], Number(gid));
  });

  writePng(path.join(professionalRoot, "tilesets", "ecoquest_tiles.png"), target.width, target.height, target.pixels);
}

function buildHero(source) {
  const target = makeCanvas(128, 192);
  const frames = [
    [24, 5], [25, 5], [24, 5], [25, 5],
    [24, 5], [25, 5], [24, 5], [25, 5],
    [24, 6], [25, 6], [24, 6], [25, 6],
    [24, 7], [25, 7], [24, 7], [25, 7],
    [24, 8], [25, 8], [24, 8], [25, 8],
    [24, 9], [25, 9], [24, 9], [25, 9],
  ];
  frames.forEach(([col, row], index) => {
    blitScaled({ source, target, sx: col * 16, sy: row * 16, sw: 16, sh: 16, dx: (index % 4) * 32, dy: Math.floor(index / 4) * 32, scale: 2 });
    decorateHeroFrame(target, index, index >= 20 ? "interact" : index >= 16 ? "collect" : "walk");
  });
  writePng(path.join(professionalRoot, "characters", "hero.png"), target.width, target.height, target.pixels);
}

function buildNpcs(source) {
  const target = makeCanvas(128, 288);
  const starts = [[24, 0], [25, 0], [26, 0], [24, 2], [25, 2], [26, 2], [24, 4], [25, 4], [26, 4]];
  starts.forEach(([col, row], npcIndex) => {
    for (let frame = 0; frame < 4; frame += 1) {
      blitScaled({ source, target, sx: col * 16, sy: (row + (frame % 2)) * 16, sw: 16, sh: 16, dx: frame * 32, dy: npcIndex * 32, scale: 2 });
      decorateNpcFrame(target, npcIndex * 4 + frame, npcIndex);
    }
  });
  writePng(path.join(professionalRoot, "characters", "npcs.png"), target.width, target.height, target.pixels);
}

function buildTrash(source) {
  const target = makeCanvas(320, 32);
  const objects = [[10, 7], [11, 7], [8, 7], [9, 7], [12, 7], [13, 7], [14, 8], [11, 8], [15, 8], [2, 15]];
  objects.forEach(([col, row], index) => {
    blitScaled({ source, target, sx: col * 16, sy: row * 16, sw: 16, sh: 16, dx: index * 32, dy: 0, scale: 2 });
  });
  writePng(path.join(professionalRoot, "objects", "trash_items.png"), target.width, target.height, target.pixels);
}

function buildStations(source) {
  const target = makeCanvas(128, 64);
  blitScaled({ source, target, sx: 12 * 16, sy: 10 * 16, sw: 32, sh: 32, dx: 0, dy: 0, scale: 2 });
  blitScaled({ source, target, sx: 15 * 16, sy: 8 * 16, sw: 32, sh: 32, dx: 64, dy: 0, scale: 2 });
  writePng(path.join(professionalRoot, "objects", "stations.png"), target.width, target.height, target.pixels);
}

function makeLayer(name, width, height, fill = 0, visible = true) {
  return {
    data: Array.from({ length: width * height }, () => fill),
    height,
    id: 0,
    name,
    opacity: 1,
    type: "tilelayer",
    visible,
    width,
    x: 0,
    y: 0,
  };
}

function objectProperties(props) {
  return Object.entries(props).map(([name, value]) => ({
    name,
    type: typeof value === "number" ? "float" : "string",
    value,
  }));
}

function objectLayer(name, objects) {
  return { draworder: "topdown", id: 0, name, objects, opacity: 1, type: "objectgroup", visible: true, x: 0, y: 0 };
}

function setTile(layer, x, y, gid) {
  if (x >= 0 && y >= 0 && x < layer.width && y < layer.height) layer.data[y * layer.width + x] = gid;
}

function fillLayer(layer, x, y, w, h, gid) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setTile(layer, xx, yy, gid);
  }
}

function edgeLayer(layer, x, y, w, h, gid) {
  for (let xx = x; xx < x + w; xx += 1) {
    setTile(layer, xx, y, gid);
    setTile(layer, xx, y + h - 1, gid);
  }
  for (let yy = y; yy < y + h; yy += 1) {
    setTile(layer, x, yy, gid);
    setTile(layer, x + w - 1, yy, gid);
  }
}

function hashed(x, y, salt = 0) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

function scatterLayer(layer, x, y, w, h, gid, chance, salt = 0, avoidLayers = []) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const blocked = avoidLayers.some((avoidLayer) => avoidLayer.data[yy * avoidLayer.width + xx] !== 0);
      if (!blocked && hashed(xx, yy, salt) < chance) setTile(layer, xx, yy, gid);
    }
  }
}

function addObject(id, name, x, y, props = {}, width = 32, height = 32, type = "") {
  return {
    height,
    id,
    name,
    point: width === 0 && height === 0,
    properties: objectProperties(props),
    rotation: 0,
    type,
    visible: true,
    width,
    x,
    y,
  };
}

function tileObject(id, name, tx, ty, props = {}, type = "") {
  return addObject(id, name, tx * 32 + 16, ty * 32 + 16, props, 0, 0, type);
}

function rectObject(id, name, tx, ty, tw, th, props = {}, type = "") {
  return addObject(id, name, tx * 32, ty * 32, props, tw * 32, th * 32, type);
}

function trashTypeFor(variant) {
  return {
    plastic_bottle: "plastic",
    soda_can: "metal",
    cardboard: "paper",
    crumpled_paper: "paper",
    plastic_bag: "plastic",
    glass_bottle: "glass",
    banana_peel: "organic",
    old_tire: "plastic",
    styrofoam: "plastic",
    fishing_net: "plastic",
  }[variant] || "plastic";
}

function placeList(layer, coords, gid) {
  coords.forEach(([x, y]) => setTile(layer, x, y, gid));
}

function stamp(layer, x, y, pattern, legend) {
  pattern.forEach((row, yy) => {
    [...row].forEach((char, xx) => {
      const gid = legend[char];
      if (gid) setTile(layer, x + xx, y + yy, gid);
    });
  });
}

function clearLayer(layer, fill = 0) {
  layer.data.fill(fill);
}

function applyHandcraftedArtPass({ width, height, ground, grassDetail, paths, shadows, water, buildings, decorations, topObjects, lighting, collision, T }) {
  [grassDetail, paths, shadows, water, buildings, decorations, topObjects, lighting, collision].forEach((layer) => clearLayer(layer));
  clearLayer(ground, T.grass);

  const terrainRows = [
    "FFFFFFFFFFFFFFFFFFFFGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLL",
    "FFFFFFFFFFFFFFFFFFFFGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLL",
    "FFFFFFFFFFFFFFFFFFFGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLL",
    "FFFFFFFFFFFFFFFFFFGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLL",
    "FFFFFFFFFFFFFFFFGGGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLL",
    "FFFFFFFFFFFFFFFGGGGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLG",
    "FFFFFFFFFFFFFFGGGGGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLGGG",
    "FFFFFFFFFFFFFGGGGGGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLGGGGG",
    "FFFFFFFFFFFGGGGGGGGGGGGPPPGGGGGGGGGGGGGWWWWWGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "FFFFFFFFFGGGGGGGGGGGGGGPPPGGGGGGGGGGGGWWWWWGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "FFFFFFFGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGWWWWWGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "FFFFFGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGWWWWWGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "FFFGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGBBBBGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGBBBBGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGWWWWWGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGWWWWWGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPPPPPPPPPPPPPPPPPPPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGEEEEEEEEEEGGGGGPPPPPPPPPPPPPPPPPPPPPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGEEEEEEEEEEGGGGGPPPGGGGGGGGGGGGGGGGPPPGGGGGDDDDDDDDDDDDDDDDGGGGGGGGGGG",
    "GGGGGGGGEEEEEEEEEEGGGGGPPPGGGGGGGGGGGGGGGGPPPGGGGGDDDDDDDDDDDDDDDDGGGGGGGGGGG",
    "GGGGGGGGEEEEEEEEEEGGGGGPPPGGGGGGGGGGGGGGGGPPPGGGGGDDDDDDDDDDDDDDDDGGGGGGGGGGG",
    "GGGGGGGGEEEEEEEEEEGGGGGPPPGGGGGGGGGGGGGGGGPPPGGGGGDDDDDDDDDDDDDDDDGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGGGGGPPPGGGGGDDDDDDDDDDDDDDDDGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGGGGGPPPGGGGGDDDDDDDDDDDDDDDDGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "WWWWWWWWWWWWWWWWWWWWWWWWBBBGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "WWWWWWWWWWWWWWWWWWWWWWWWBBBGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "WWWWWWWWWWWWWWWWWWWWWWWWBBBGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "WWWWWWWWWWWWWWWWWWWWWWWWBBBGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPPPGGGGGGGGGG",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCCCC",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCCCC",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCCCC",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCCCC",
    "SSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCCCC",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
    "RRRRRRRRRRRRRRRRRRRRRRRRGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGCCCCCCCCCCCCCCCCCCCC",
  ];

  const terrainLegend = {
    F: T.darkGrass,
    G: T.grass,
    E: T.grassBright,
    D: T.dirt,
    P: T.dirt,
    B: T.bridge,
    S: T.sand,
    C: T.city,
    R: T.dirt,
    W: T.waterA,
    L: T.waterA,
  };

  terrainRows.forEach((row, y) => {
    [...row.padEnd(width, "G").slice(0, width)].forEach((char, x) => {
      const gid = terrainLegend[char] || T.grass;
      if (char === "W" || char === "L") {
        setTile(water, x, y, (x + y) % 2 ? T.waterA : T.waterB);
        setTile(collision, x, y, 79);
      } else {
        setTile(ground, x, y, gid);
      }
      if (char === "P" || char === "B") setTile(paths, x, y, char === "B" ? T.bridge : T.dirt);
      if (char === "B") setTile(collision, x, y, 0);
    });
  });

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if (!water.data[y * width + x]) continue;
      const touchesLand =
        !water.data[y * width + x - 1] ||
        !water.data[y * width + x + 1] ||
        !water.data[(y - 1) * width + x] ||
        !water.data[(y + 1) * width + x];
      if (touchesLand && !paths.data[y * width + x]) setTile(topObjects, x, y, T.riverBank);
    }
  }

  const buildingLegend = { R: T.warmRoof, W: T.wall, D: T.door, O: T.window, E: T.ecoCenter };
  [
    [8, 17, ["RRRRRRRR", "RROOOORR", "WWWWWWWW", "WWODOWWW", "WWWWWWWW"]],
    [58, 28, ["RRRRRRRRRRRR", "RROOOOOOOORR", "WWWWWWWWWWWW", "WWOOWWWWOOWW", "WWWWWDWWWWWW", "WWWWWWWWWWWW"]],
    [52, 36, ["RRRRRR", "RROORR", "WWWWWW", "WWDWWW", "WWWWWW"]],
    [67, 36, ["RRRRRRR", "ROOOOOR", "WWWWWWW", "WWWDWWW", "WWWWWWW"]],
    [5, 43, ["RRRRRRRRR", "RROOOOORR", "WWWWWWWWW", "WWWDEWWWW", "WWWWWWWWW"]],
    [47, 20, ["RRRRRRRR", "RROOOORR", "WWWWWWWW", "WWWDWWWW", "WWWWWWWW"]],
  ].forEach(([x, y, pattern]) => {
    stamp(shadows, x + 1, y + pattern.length - 1, ["99999999", "99999999"], { 9: T.shadowLarge });
    stamp(buildings, x, y, pattern, buildingLegend);
    fillLayer(collision, x, y, pattern[0].length, pattern.length - 1, 79);
  });

  const treeCoords = [
    [1, 1], [4, 1], [7, 1], [10, 1], [13, 1], [16, 2], [2, 4], [5, 4], [9, 4], [14, 4], [18, 5],
    [3, 7], [7, 8], [11, 8], [16, 9], [20, 10], [29, 3], [34, 4], [31, 8], [36, 11], [30, 15],
    [70, 13], [74, 14], [77, 16], [69, 19], [75, 21], [31, 35], [35, 36], [39, 37], [44, 35],
    [3, 15], [6, 18], [17, 14], [19, 18], [50, 6], [54, 8], [58, 10], [52, 14], [36, 18],
  ];
  treeCoords.forEach(([x, y], index) => {
    setTile(shadows, x, y + 1, T.shadowLarge);
    setTile(decorations, x, y, index % 3 === 0 ? T.treeCanopy : index % 3 === 1 ? T.treeA : T.fruitTree);
    setTile(collision, x, y, 79);
  });

  placeList(grassDetail, [[24, 5], [26, 6], [29, 6], [33, 9], [48, 4], [53, 5], [57, 7], [13, 23], [17, 24], [21, 22], [39, 22], [42, 25], [45, 27], [50, 28], [35, 31], [38, 32], [43, 33], [50, 31], [32, 39], [37, 38], [44, 40], [64, 18], [67, 20], [72, 22]], T.grassClump);
  placeList(grassDetail, [[11, 24], [15, 25], [18, 26], [37, 23], [40, 24], [43, 25], [48, 25], [52, 24], [55, 26], [34, 36], [41, 37], [47, 38], [28, 17], [32, 18], [36, 19], [61, 16], [66, 17], [73, 18], [6, 20], [8, 22], [20, 20], [27, 20], [30, 22], [33, 24], [57, 19], [60, 20], [63, 21], [67, 22], [72, 24], [10, 34], [14, 35], [19, 34], [25, 38], [30, 38], [52, 37], [58, 36], [74, 37]], T.flowerPatch);
  placeList(decorations, [[7, 24], [14, 26], [20, 23], [28, 24], [31, 26], [35, 28], [42, 30], [49, 30], [54, 30], [62, 32], [72, 31], [12, 37], [18, 39], [24, 36], [31, 39], [39, 40], [47, 39], [6, 21], [22, 18], [28, 18], [34, 21], [40, 21], [45, 22], [53, 23], [57, 25], [61, 23], [65, 25], [69, 24], [73, 26], [55, 38], [62, 38], [70, 39], [76, 40]], T.bush);
  placeList(decorations, [[3, 35], [6, 37], [11, 38], [16, 36], [21, 40], [5, 45], [18, 46], [29, 30], [33, 29], [57, 39], [62, 40], [76, 38], [27, 6], [35, 8], [38, 17], [44, 16], [49, 14], [53, 16], [64, 14], [70, 16], [74, 19], [7, 32], [14, 31], [22, 33]], T.rock);
  placeList(decorations, [[6, 25], [18, 24], [31, 25], [55, 34], [71, 34], [12, 45], [61, 40], [75, 40]], T.lamp);
  placeList(decorations, [[12, 24], [15, 24], [38, 28], [50, 27], [63, 35], [69, 35]], T.bench);
  placeList(decorations, [[25, 16], [29, 26], [44, 18], [62, 27], [20, 36], [11, 42], [56, 37]], T.sign);
  placeList(decorations, [[34, 9], [37, 10], [42, 15], [64, 12], [67, 13], [69, 10], [21, 30], [23, 31], [26, 32], [3, 29], [6, 29], [12, 29], [18, 29], [28, 31], [33, 12], [39, 12], [65, 8], [71, 8], [76, 10]], T.reeds);
  placeList(decorations, [[3, 23], [5, 24], [21, 21], [23, 23], [31, 18], [33, 19], [41, 20], [43, 22], [49, 19], [51, 21], [59, 22], [61, 24], [69, 21], [71, 23], [10, 33], [13, 34], [40, 34], [43, 35], [68, 36], [71, 37]], T.butterfly);
  placeList(topObjects, [[47, 18], [48, 18], [49, 18], [50, 18], [51, 18], [52, 18], [53, 18], [54, 18], [55, 18], [56, 18], [47, 32], [48, 32], [49, 32], [50, 32], [51, 32], [52, 32], [53, 32], [54, 32], [55, 32], [56, 32]], T.woodFence);
  placeList(topObjects, [[57, 35], [58, 35], [59, 35], [60, 35], [61, 35], [62, 35], [63, 35], [64, 35], [65, 35], [66, 35], [67, 35], [68, 35], [69, 35], [70, 35], [71, 35], [72, 35], [73, 35]], T.whiteFence);
  placeList(lighting, [[6, 25], [18, 24], [31, 25], [55, 34], [71, 34], [12, 45], [61, 40], [75, 40], [10, 22], [64, 33]], T.glow);
  placeList(shadows, [[9, 22], [10, 22], [11, 22], [12, 22], [13, 22], [59, 34], [60, 34], [61, 34], [62, 34], [63, 34], [64, 34], [65, 34], [66, 34], [67, 34]], T.shadowSmall);
}

function installMap() {
  const targetMap = path.join(professionalRoot, "maps", "eco_world.json");
  const width = 80;
  const height = 50;
  const ground = makeLayer("ground", width, height, 1);
  const grassDetail = makeLayer("grass_detail", width, height);
  const paths = makeLayer("paths", width, height);
  const shadows = makeLayer("shadows", width, height);
  const water = makeLayer("water", width, height);
  const buildings = makeLayer("buildings", width, height);
  const decorations = makeLayer("decorations", width, height);
  const topObjects = makeLayer("top_objects", width, height);
  const lighting = makeLayer("lighting", width, height);
  const collision = makeLayer("collision", width, height, 0, false);

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
    treeB: 11,
    bush: 12,
    flowers: 13,
    rock: 14,
    fenceH: 15,
    fenceV: 16,
    door: 17,
    window: 18,
    wall: 19,
    lamp: 20,
    bench: 21,
    sign: 22,
    ecoCenter: 23,
    bin: 24,
    whiteFence: 25,
    bridge: 26,
    darkGrass: 27,
    warmRoof: 28,
    beachWater: 30,
    grassClump: 33,
    reeds: 35,
    flowerPatch: 36,
    shadowSmall: 37,
    shadowLarge: 38,
    cliff: 39,
    glow: 41,
    treeCanopy: 42,
    waterfall: 43,
    riverBank: 44,
    woodFence: 45,
    butterfly: 46,
    fruitTree: 47,
    softShadow: 48,
  };

  fillLayer(ground, 0, 0, width, height, T.grass);
  scatterLayer(ground, 0, 0, width, height, T.grassBright, 0.18, 1);
  fillLayer(ground, 0, 0, 22, 15, T.darkGrass);
  fillLayer(ground, 0, 34, 23, 10, T.sand);
  fillLayer(ground, 52, 36, 28, 14, T.city);
  fillLayer(ground, 48, 2, 30, 12, T.grassBright);
  fillLayer(ground, 3, 18, 30, 11, T.grassBright);
  fillLayer(ground, 36, 20, 24, 13, T.dirt);
  fillLayer(ground, 4, 44, 29, 6, T.dirt);

  for (let y = 29; y < 38; y += 1) {
    const left = 0 + Math.max(0, Math.floor((34 - y) / 2));
    const right = 26 + Math.floor(Math.sin(y * 0.9) * 2);
    fillLayer(water, left, y, Math.max(10, right - left), 1, y % 2 ? T.waterA : T.waterB);
    fillLayer(collision, left, y, Math.max(10, right - left), 1, 79);
  }
  for (let y = 0; y < 22; y += 1) {
    const x = 38 + Math.floor(Math.sin(y * 0.55) * 3);
    fillLayer(water, x, y, 5, 1, y % 2 ? T.waterA : T.waterB);
    fillLayer(collision, x, y, 5, 1, 79);
  }
  fillLayer(water, 63, 0, 17, 12, T.waterA);
  scatterLayer(water, 63, 0, 17, 12, T.waterB, 0.35, 5);
  fillLayer(collision, 63, 0, 17, 12, 79);
  fillLayer(water, 0, 42, 80, 8, T.beachWater);
  scatterLayer(water, 0, 42, 80, 8, T.waterB, 0.25, 6);
  fillLayer(collision, 0, 42, 80, 8, 79);

  fillLayer(paths, 22, 0, 3, 43, T.dirt);
  fillLayer(paths, 0, 25, 64, 3, T.dirt);
  fillLayer(paths, 45, 12, 3, 30, T.dirt);
  fillLayer(paths, 58, 25, 3, 17, T.stone);
  fillLayer(paths, 34, 30, 19, 3, T.dirt);
  fillLayer(paths, 24, 32, 4, 4, T.bridge);
  fillLayer(collision, 24, 32, 4, 4, 0);
  fillLayer(paths, 40, 11, 2, 5, T.bridge);
  fillLayer(collision, 40, 11, 2, 5, 0);

  const structures = [
    { x: 8, y: 18, w: 8, h: 5, roof: T.warmRoof, wall: T.wall, door: 11, name: "Eco Center" },
    { x: 59, y: 29, w: 10, h: 6, roof: T.warmRoof, wall: T.wall, door: 64, name: "School" },
    { x: 53, y: 38, w: 6, h: 5, roof: T.warmRoof, wall: T.wall, door: 56, name: "House" },
    { x: 67, y: 37, w: 7, h: 5, roof: T.warmRoof, wall: T.wall, door: 70, name: "Town Hall" },
    { x: 5, y: 44, w: 9, h: 5, roof: T.warmRoof, wall: T.wall, door: 9, name: "Recycle Facility" },
    { x: 47, y: 21, w: 8, h: 5, roof: T.warmRoof, wall: T.wall, door: 51, name: "Garden House" },
  ];
  structures.forEach((building) => {
    fillLayer(shadows, building.x + 1, building.y + building.h - 1, building.w, 2, T.shadowLarge);
    fillLayer(buildings, building.x, building.y, building.w, 2, building.roof);
    fillLayer(buildings, building.x, building.y + 2, building.w, building.h - 2, building.wall);
    setTile(buildings, building.door, building.y + building.h - 1, T.door);
    setTile(buildings, building.x + 2, building.y + 3, T.window);
    setTile(buildings, building.x + building.w - 3, building.y + 3, T.window);
    fillLayer(collision, building.x, building.y, building.w, building.h - 1, 79);
  });

  const treeClusters = [
    [1, 1, 19, 12, 0.24, 12],
    [28, 2, 9, 19, 0.18, 13],
    [29, 34, 16, 8, 0.16, 14],
    [67, 13, 11, 13, 0.18, 15],
    [2, 15, 10, 10, 0.1, 16],
  ];
  treeClusters.forEach(([x, y, w, h, chance, salt]) => {
    for (let yy = y; yy < y + h; yy += 2) {
      for (let xx = x; xx < x + w; xx += 2) {
        if (hashed(xx, yy, salt) < chance && !water.data[yy * width + xx]) {
          setTile(shadows, xx, yy + 1, T.shadowLarge);
          setTile(decorations, xx, yy, hashed(xx, yy, salt + 1) > 0.5 ? T.treeA : T.treeCanopy);
          setTile(collision, xx, yy, 79);
        }
      }
    }
  });
  scatterLayer(grassDetail, 0, 0, width, 42, T.grassClump, 0.06, 20, [water, buildings]);
  scatterLayer(grassDetail, 0, 0, width, 42, T.flowers, 0.035, 21, [water, buildings]);
  scatterLayer(grassDetail, 36, 21, 21, 10, T.flowerPatch, 0.09, 22, [buildings]);
  scatterLayer(decorations, 4, 17, 26, 12, T.bush, 0.06, 23, [water, buildings]);
  scatterLayer(decorations, 0, 34, 22, 7, T.rock, 0.045, 24, [water]);
  scatterLayer(decorations, 28, 28, 20, 11, T.rock, 0.02, 25, [water, buildings]);
  scatterLayer(topObjects, 63, 15, 14, 11, T.whiteFence, 0.07, 26, [water, buildings]);
  scatterLayer(topObjects, 48, 2, 13, 10, T.woodFence, 0.04, 27, [water, buildings]);

  [
    [16, 24, T.bench], [18, 24, T.lamp], [26, 25, T.sign], [33, 31, T.sign], [61, 28, T.sign],
    [55, 34, T.lamp], [72, 34, T.lamp], [10, 40, T.sign], [50, 27, T.bench], [44, 18, T.sign],
    [12, 27, T.bench], [6, 25, T.lamp], [33, 7, T.reeds], [42, 7, T.reeds], [65, 12, T.reeds],
  ].forEach(([x, y, gid]) => setTile(decorations, x, y, gid));

  structures.forEach((building) => {
    setTile(lighting, building.x + 1, building.y + building.h, T.glow);
    setTile(lighting, building.x + building.w - 2, building.y + building.h, T.glow);
  });
  scatterLayer(lighting, 0, 0, width, height, T.softShadow, 0.025, 31, [water]);

  applyHandcraftedArtPass({ width, height, ground, grassDetail, paths, shadows, water, buildings, decorations, topObjects, lighting, collision, T });

  let id = 1;
  const areas = [
    rectObject(id++, "Hutan Kecil", 0, 0, 22, 15, { areaId: "forest" }, "area"),
    rectObject(id++, "Danau", 60, 0, 20, 14, { areaId: "lake" }, "area"),
    rectObject(id++, "Eco Center", 4, 15, 24, 15, { areaId: "recycling" }, "area"),
    rectObject(id++, "Kebun", 36, 18, 24, 16, { areaId: "garden" }, "area"),
    rectObject(id++, "Sekolah Hijau", 55, 25, 25, 12, { areaId: "school" }, "area"),
    rectObject(id++, "Kota Kecil", 52, 36, 28, 8, { areaId: "city" }, "area"),
    rectObject(id++, "Pantai", 0, 34, 80, 16, { areaId: "beach" }, "area"),
    rectObject(id++, "Sungai", 0, 28, 31, 10, { areaId: "river" }, "area"),
    rectObject(id++, "Camping Ground", 24, 1, 18, 22, { areaId: "camping" }, "area"),
    rectObject(id++, "Area Industri Kecil", 0, 44, 23, 6, { areaId: "industry" }, "area"),
  ];

  const playerSpawn = [tileObject(id++, "spawn", 31, 29, {})];
  const npcs = [
    ["prof_eco", "Prof. Eco", "recycling", 13, 25, 0],
    ["guru_maya", "Guru Maya", "school", 64, 35, 1],
    ["ranger_adi", "Ranger Adi", "forest", 12, 10, 2],
    ["nelayan_jaya", "Nelayan Jaya", "beach", 18, 38, 3],
    ["lina", "Lina", "school", 70, 32, 4],
    ["park_guard", "Pak Hadi", "recycling", 19, 27, 5],
    ["cleaner_bima", "Bima", "industry", 14, 46, 6],
    ["vendor_sari", "Sari", "city", 56, 40, 7],
    ["dr_nara", "Dr. Nara", "lake", 62, 15, 8],
  ].map(([npcId, name, areaId, x, y, frame]) => tileObject(id++, name, x, y, { npcId, areaId, frame }, "npc"));

  const trashPlacements = [
    ["plastic_bottle", "recycling", 7, 25], ["crumpled_paper", "recycling", 14, 24], ["soda_can", "recycling", 21, 27],
    ["cardboard", "recycling", 27, 24], ["glass_bottle", "recycling", 18, 28], ["banana_peel", "recycling", 9, 27],
    ["plastic_bag", "school", 57, 31], ["soda_can", "school", 63, 33], ["crumpled_paper", "school", 68, 31],
    ["cardboard", "school", 74, 34], ["plastic_bottle", "school", 70, 29], ["glass_bottle", "school", 60, 35],
    ["banana_peel", "forest", 5, 6], ["plastic_bottle", "forest", 9, 11], ["styrofoam", "forest", 15, 8],
    ["crumpled_paper", "forest", 19, 13], ["plastic_bag", "forest", 3, 13], ["soda_can", "forest", 17, 5],
    ["fishing_net", "beach", 6, 36], ["plastic_bottle", "beach", 12, 38], ["styrofoam", "beach", 18, 37],
    ["glass_bottle", "beach", 23, 40], ["plastic_bag", "beach", 31, 36], ["old_tire", "beach", 39, 39],
    ["soda_can", "beach", 48, 37], ["fishing_net", "beach", 56, 40], ["plastic_bottle", "beach", 66, 38],
    ["plastic_bag", "river", 4, 28], ["glass_bottle", "river", 10, 29], ["soda_can", "river", 16, 30],
    ["styrofoam", "river", 22, 28], ["fishing_net", "river", 26, 32],
    ["banana_peel", "garden", 39, 23], ["crumpled_paper", "garden", 43, 25], ["plastic_bottle", "garden", 50, 27],
    ["cardboard", "garden", 55, 24], ["soda_can", "garden", 51, 31],
    ["plastic_bottle", "city", 54, 38], ["soda_can", "city", 60, 41], ["crumpled_paper", "city", 66, 39],
    ["glass_bottle", "city", 72, 41], ["cardboard", "city", 76, 38],
    ["banana_peel", "camping", 28, 7], ["soda_can", "camping", 35, 12], ["plastic_bag", "camping", 31, 17],
    ["cardboard", "industry", 5, 45], ["old_tire", "industry", 15, 46], ["styrofoam", "industry", 20, 48],
  ];
  const trash = trashPlacements
    .filter(([, , tx, ty]) => !collision.data[ty * width + tx])
    .map(([variant, areaId, tx, ty], index) =>
      tileObject(id++, variant, tx, ty, { variant, areaId, trashType: trashTypeFor(variant), rarity: index % 11 === 0 ? "rare" : "common" }, "trash")
    );

  const stations = [
    tileObject(id++, "Eco Center Station", 11, 24, { stationId: "eco_center", areaId: "recycling", frame: 0, accepts: "plastic,paper,metal,glass" }, "station"),
    tileObject(id++, "TPS Kota", 12, 47, { stationId: "city_tps", areaId: "industry", frame: 1, accepts: "organic,plastic,paper,metal,glass" }, "station"),
    tileObject(id++, "Sorting Bin Sekolah", 67, 34, { stationId: "school_sorting", areaId: "school", frame: 1, accepts: "paper,plastic,metal" }, "station"),
    tileObject(id++, "Recycle Pantai", 22, 39, { stationId: "beach_recycle", areaId: "beach", frame: 0, accepts: "plastic,glass,metal" }, "station"),
  ];

  const ambient = [
    [7, 18, 0], [18, 18, 0], [38, 25, 0], [53, 23, 0], [68, 13, 1], [15, 8, 1],
    [30, 6, 1], [64, 31, 0], [44, 35, 0], [8, 37, 1], [70, 41, 1], [57, 14, 0],
  ].map(([x, y, frame]) => tileObject(id++, `ambient_${id}`, x, y, { frame }, "ambient"));

  const map = {
    compressionlevel: -1,
    height,
    infinite: false,
    layers: [
      ground,
      grassDetail,
      paths,
      shadows,
      water,
      buildings,
      decorations,
      topObjects,
      lighting,
      collision,
      objectLayer("areas", areas),
      objectLayer("trash", trash),
      objectLayer("npcs", npcs),
      objectLayer("stations", stations),
      objectLayer("ambient", ambient),
      objectLayer("player_spawn", playerSpawn),
    ],
    nextlayerid: 17,
    nextobjectid: id,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.11.0",
    tileheight: 32,
    tilesets: [
      {
        columns: 8,
        firstgid: 1,
        image: "../tilesets/ecoquest_tiles.png",
        imageheight: 320,
        imagewidth: 256,
        margin: 0,
        name: "ecoquest_tiles",
        spacing: 0,
        tilecount: 80,
        tileheight: 32,
        tilewidth: 32,
      },
    ],
    tilewidth: 32,
    type: "map",
    version: "1.10",
    width,
  };
  map.layers.forEach((layer, index) => {
    layer.id = index + 1;
  });
  ensureDir(targetMap);
  fs.writeFileSync(targetMap, `${JSON.stringify(map, null, 2)}\n`);
}

function copyLicense() {
  const license = path.join(kenneyRoot, "License.txt");
  if (fs.existsSync(license)) {
    fs.copyFileSync(license, path.join(professionalRoot, "KENNEY_RPG_URBAN_LICENSE.txt"));
  }
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function installTiledWorkspace() {
  const tiledRoot = path.join(professionalRoot, "tiled");
  const projectPath = path.join(tiledRoot, "ecoquest.tiled-project");
  const worldPath = path.join(tiledRoot, "ecoquest.world");
  const guidePath = path.join(tiledRoot, "HANDCRAFTED_MAP_GUIDE.md");
  const tilesetPath = path.join(professionalRoot, "tilesets", "ecoquest_tiles.tsj");

  writeJson(projectPath, {
    automappingRulesFile: "",
    commands: [],
    extensionsPath: "extensions",
    folders: [".."],
    propertyTypes: [
      {
        color: "#7dd3fc",
        drawFill: true,
        id: 1,
        members: [
          { name: "areaId", propertyType: "string", type: "string", value: "" },
          { name: "cleanlinessTarget", type: "int", value: 100 },
        ],
        name: "PixelTerraArea",
        type: "class",
        useAs: ["object"],
      },
      {
        color: "#86efac",
        drawFill: true,
        id: 2,
        members: [
          { name: "variant", propertyType: "string", type: "string", value: "plastic_bottle" },
          { name: "trashType", propertyType: "string", type: "string", value: "plastic" },
          { name: "areaId", propertyType: "string", type: "string", value: "recycling" },
          { name: "rarity", propertyType: "string", type: "string", value: "common" },
        ],
        name: "PixelTerraTrash",
        type: "class",
        useAs: ["object"],
      },
      {
        color: "#fbbf24",
        drawFill: true,
        id: 3,
        members: [
          { name: "npcId", propertyType: "string", type: "string", value: "prof_eco" },
          { name: "areaId", propertyType: "string", type: "string", value: "recycling" },
          { name: "frame", type: "int", value: 0 },
        ],
        name: "PixelTerraNPC",
        type: "class",
        useAs: ["object"],
      },
      {
        color: "#c084fc",
        drawFill: true,
        id: 4,
        members: [
          { name: "stationId", propertyType: "string", type: "string", value: "eco_center" },
          { name: "areaId", propertyType: "string", type: "string", value: "recycling" },
          { name: "frame", type: "int", value: 0 },
          { name: "accepts", propertyType: "string", type: "string", value: "plastic,paper,metal,glass" },
        ],
        name: "PixelTerraStation",
        type: "class",
        useAs: ["object"],
      },
    ],
  });

  writeJson(worldPath, {
    maps: [
      {
        fileName: "../maps/eco_world.json",
        height: 1600,
        width: 2560,
        x: 0,
        y: 0,
      },
    ],
    onlyShowAdjacentMaps: false,
    type: "world",
  });

  writeJson(tilesetPath, {
    columns: 8,
    image: "ecoquest_tiles.png",
    imageheight: 320,
    imagewidth: 256,
    margin: 0,
    name: "ecoquest_tiles",
    spacing: 0,
    tilecount: 80,
    tiledversion: "1.11.0",
    tileheight: 32,
    tilewidth: 32,
    type: "tileset",
    version: "1.10",
  });

  ensureDir(guidePath);
  fs.writeFileSync(
    guidePath,
    [
      "# PixelTerra Handcrafted Map Guide",
      "",
      "Open `ecoquest.tiled-project` in Tiled Map Editor, then open `ecoquest.world` or `../maps/eco_world.json`.",
      "",
      "Layer contract used by Phaser:",
      "",
      "1. `ground` - base terrain only.",
      "2. `grass_detail` - non-blocking grass, flowers, small ground detail.",
      "3. `paths` - dirt, bridge, and walkable route tiles.",
      "4. `shadows` - soft environmental depth below buildings/trees.",
      "5. `water` - animated water tiles only.",
      "6. `buildings` - static landmark/building body tiles.",
      "7. `decorations` - mid-layer props such as rocks, bushes, benches, lamps, signs.",
      "8. `top_objects` - foreground and overlap detail such as river banks/fences.",
      "9. `lighting` - glow and additive lighting accents.",
      "10. `collision` - invisible blocking layer, use any non-zero tile.",
      "",
      "Object layers:",
      "",
      "- `areas`: rectangles with `areaId`.",
      "- `trash`: point objects with `variant`, `trashType`, `areaId`, `rarity`.",
      "- `npcs`: point objects with `npcId`, `areaId`, `frame`.",
      "- `stations`: point objects with `stationId`, `areaId`, `frame`, `accepts`.",
      "- `ambient`: point objects with `frame` for ambient life.",
      "- `player_spawn`: one point object.",
      "",
      "Composition rules:",
      "",
      "- Keep paths readable from spawn to Eco Center, school, beach, river, lake, and TPS.",
      "- Use `top_objects` for overlap/foreground, not `collision`.",
      "- Add collision only to water, building bodies, dense trees, fences, cliffs, and large props.",
      "- Add trash manually near story beats, not randomly across empty fields.",
      "- Keep NPCs near landmarks and leave at least one tile of walkable space around them.",
      "",
    ].join("\n")
  );
}

function copyFileIfExists(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return false;
  ensureDir(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

function installUiAndAudio() {
  const copied = [];
  const uiTileRoot = path.join(uiPackRoot, "Tiles", "Large tiles", "Thick outline");
  const uiTilesheetRoot = path.join(uiPackRoot, "Tilesheets", "Large tiles", "Thick outline");
  const audioRoot = path.join(interfaceSoundsRoot, "Audio");

  [
    [path.join(uiTilesheetRoot, "tilemap_packed.png"), path.join(professionalRoot, "ui", "pixel_ui_tiles.png")],
    [path.join(uiTileRoot, "tile_0016.png"), path.join(professionalRoot, "ui", "panel_dark.png")],
    [path.join(uiTileRoot, "tile_0028.png"), path.join(professionalRoot, "ui", "button_dark.png")],
    [path.join(uiPackRoot, "License.txt"), path.join(professionalRoot, "KENNEY_UI_PIXEL_ADVENTURE_LICENSE.txt")],
    [path.join(audioRoot, "click_001.ogg"), path.join(professionalRoot, "audio", "ui_click.ogg")],
    [path.join(audioRoot, "confirmation_001.ogg"), path.join(professionalRoot, "audio", "collect.ogg")],
    [path.join(audioRoot, "drop_001.ogg"), path.join(professionalRoot, "audio", "recycle.ogg")],
    [path.join(audioRoot, "error_001.ogg"), path.join(professionalRoot, "audio", "error.ogg")],
    [path.join(audioRoot, "switch_001.ogg"), path.join(professionalRoot, "audio", "footstep.ogg")],
    [path.join(audioRoot, "click_003.ogg"), path.join(professionalRoot, "audio", "dialog_blip.ogg")],
    [path.join(audioRoot, "select_001.ogg"), path.join(professionalRoot, "audio", "ui_hover.ogg")],
    [path.join(audioRoot, "confirmation_004.ogg"), path.join(professionalRoot, "audio", "level_up.ogg")],
    [path.join(interfaceSoundsRoot, "License.txt"), path.join(professionalRoot, "KENNEY_INTERFACE_SOUNDS_LICENSE.txt")],
    [forestAmbiencePath, path.join(professionalRoot, "audio", "ambient_forest.mp3")],
  ].forEach(([sourcePath, targetPath]) => {
    if (copyFileIfExists(sourcePath, targetPath)) copied.push(path.relative(professionalRoot, targetPath));
  });

  return copied;
}

if (!fs.existsSync(sourceTilesPath)) {
  console.error(`Missing Kenney source tiles: ${sourceTilesPath}`);
  console.error("Download/extract Kenney RPG Urban Pack first, or run the earlier download step.");
  process.exit(1);
}

const source = decodePng(sourceTilesPath);
buildTileset(source);
buildHero(source);
buildNpcs(source);
buildTrash(source);
buildStations(source);
installMap();
copyLicense();
const copiedUiAndAudio = installUiAndAudio();
installTiledWorkspace();

console.log("Installed CC0 professional PixelTerra assets from Kenney RPG Urban Pack.");
if (copiedUiAndAudio.length) {
  console.log(`Installed UI/audio assets: ${copiedUiAndAudio.length} files.`);
}
