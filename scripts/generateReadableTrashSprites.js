const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outPath = path.join(process.cwd(), "public", "assets", "pixel", "professional", "objects", "trash_items.png");
const backupPath = path.join(process.cwd(), "public", "assets", "pixel", "professional", "objects", "trash_items.before-readable-16.png");

const FRAME = 32;
const FRAMES = 16;
const WIDTH = FRAME * FRAMES;
const HEIGHT = FRAME;

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

const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

function setPixel(frame, x, y, color, alpha = 255) {
  if (x < 0 || y < 0 || x >= FRAME || y >= FRAME) return;
  const px = frame * FRAME + x;
  const i = (y * WIDTH + px) * 4;
  pixels[i] = (color >> 16) & 255;
  pixels[i + 1] = (color >> 8) & 255;
  pixels[i + 2] = color & 255;
  pixels[i + 3] = alpha;
}

function rect(frame, x, y, w, h, color, alpha = 255) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setPixel(frame, xx, yy, color, alpha);
  }
}

function line(frame, x0, y0, x1, y1, color, alpha = 255) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  while (true) {
    setPixel(frame, x, y, color, alpha);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function ellipse(frame, cx, cy, rx, ry, color, alpha = 255) {
  for (let y = cy - ry; y <= cy + ry; y += 1) {
    for (let x = cx - rx; x <= cx + rx; x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) setPixel(frame, x, y, color, alpha);
    }
  }
}

function outline(frame, color = 0x02131b) {
  const source = new Uint8Array(pixels);
  for (let y = 0; y < FRAME; y += 1) {
    for (let x = 0; x < FRAME; x += 1) {
      const i = (y * WIDTH + frame * FRAME + x) * 4;
      if (source[i + 3] > 0) continue;
      const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
      const touches = neighbors.some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= FRAME || ny >= FRAME) return false;
        return source[(ny * WIDTH + frame * FRAME + nx) * 4 + 3] > 80;
      });
      if (touches) setPixel(frame, x, y, color, 245);
    }
  }
}

function shadow(frame) {
  ellipse(frame, 16, 26, 9, 3, 0x020617, 95);
}

function shine(frame, x, y) {
  setPixel(frame, x, y, 0xecfeff);
  setPixel(frame, x + 1, y, 0x67e8f9);
  setPixel(frame, x, y + 1, 0x67e8f9);
}

const C = {
  cyan: 0x67e8f9,
  cyanDark: 0x0891b2,
  blue: 0x60a5fa,
  green: 0x34d399,
  lime: 0xbef264,
  yellow: 0xfacc15,
  orange: 0xfb923c,
  red: 0xf87171,
  brown: 0x92400e,
  tan: 0xfcd34d,
  paper: 0xf8e7b0,
  grey: 0x94a3b8,
  darkGrey: 0x475569,
  white: 0xecfeff,
  purple: 0xa78bfa,
};

function drawPlasticBottle(f) {
  shadow(f); rect(f, 13, 5, 6, 4, C.blue); rect(f, 12, 9, 8, 15, C.cyan); rect(f, 14, 12, 5, 8, C.white, 180); rect(f, 12, 18, 8, 3, C.blue); shine(f, 17, 10); outline(f);
}

function drawPlasticBag(f) {
  shadow(f); rect(f, 10, 12, 12, 12, C.white, 220); line(f, 11, 12, 14, 7, C.cyan); line(f, 21, 12, 18, 7, C.cyan); rect(f, 12, 15, 8, 2, C.cyan); rect(f, 13, 19, 7, 1, C.blue); outline(f);
}

function drawPlasticCup(f) {
  shadow(f); rect(f, 10, 9, 13, 3, C.white); rect(f, 12, 12, 9, 12, C.cyan); rect(f, 13, 14, 7, 7, C.white, 150); line(f, 10, 9, 12, 24, C.cyanDark); line(f, 23, 9, 21, 24, C.cyanDark); outline(f);
}

function drawStraw(f) {
  shadow(f); line(f, 8, 22, 23, 7, C.red); line(f, 9, 23, 24, 8, C.white); line(f, 20, 8, 25, 8, C.red); line(f, 20, 9, 25, 9, C.white); outline(f);
}

function drawSnackWrapper(f) {
  shadow(f); rect(f, 8, 12, 16, 10, C.orange); rect(f, 10, 14, 12, 6, C.yellow); line(f, 8, 12, 5, 15, C.red); line(f, 24, 12, 27, 15, C.red); line(f, 8, 22, 5, 19, C.red); line(f, 24, 22, 27, 19, C.red); rect(f, 13, 16, 5, 2, C.red); outline(f);
}

function drawCardboard(f) {
  shadow(f); rect(f, 8, 10, 17, 14, C.brown); rect(f, 10, 12, 13, 10, C.tan); line(f, 8, 10, 16, 6, C.tan); line(f, 25, 10, 16, 6, C.brown); line(f, 16, 6, 16, 23, C.brown); outline(f);
}

function drawCan(f) {
  shadow(f); ellipse(f, 16, 8, 6, 2, C.grey); rect(f, 10, 8, 12, 15, C.red); ellipse(f, 16, 23, 6, 2, C.darkGrey); rect(f, 12, 12, 8, 3, C.white); rect(f, 13, 16, 6, 2, C.yellow); shine(f, 19, 9); outline(f);
}

function drawBattery(f) {
  shadow(f); rect(f, 9, 12, 15, 10, C.darkGrey); rect(f, 24, 15, 2, 4, C.grey); rect(f, 11, 14, 5, 6, C.lime); rect(f, 18, 14, 4, 2, C.yellow); rect(f, 19, 17, 2, 4, C.yellow); outline(f);
}

function drawMask(f) {
  shadow(f); rect(f, 9, 13, 14, 8, C.cyan); rect(f, 11, 15, 10, 1, C.white); rect(f, 11, 18, 10, 1, C.white); line(f, 9, 14, 5, 12, C.white); line(f, 23, 14, 27, 12, C.white); line(f, 9, 20, 5, 22, C.white); line(f, 23, 20, 27, 22, C.white); outline(f);
}

function drawOrganic(f) {
  shadow(f); ellipse(f, 14, 18, 7, 5, C.green); ellipse(f, 19, 15, 5, 4, C.lime); line(f, 18, 11, 22, 8, C.brown); rect(f, 12, 20, 9, 3, C.brown); outline(f);
}

function drawCigarette(f) {
  shadow(f); line(f, 8, 21, 23, 13, C.paper); line(f, 22, 13, 27, 11, C.orange); line(f, 25, 11, 28, 10, C.red); setPixel(f, 27, 9, C.yellow); outline(f);
}

function drawGlassBottle(f) {
  shadow(f); rect(f, 14, 5, 5, 5, C.green); rect(f, 12, 10, 9, 14, C.teal || 0x2dd4bf); rect(f, 14, 12, 5, 9, C.white, 135); rect(f, 12, 18, 9, 2, C.green); shine(f, 18, 10); outline(f);
}

function drawStyrofoam(f) {
  shadow(f); rect(f, 8, 11, 17, 12, C.white); rect(f, 10, 13, 13, 8, 0xcbd5e1); rect(f, 12, 15, 8, 1, C.white); rect(f, 13, 18, 6, 1, C.white); outline(f);
}

function drawCable(f) {
  shadow(f); line(f, 7, 19, 12, 13, C.darkGrey); line(f, 12, 13, 19, 20, C.darkGrey); line(f, 19, 20, 25, 13, C.darkGrey); line(f, 8, 20, 13, 14, C.cyan); rect(f, 23, 11, 4, 4, C.grey); rect(f, 5, 18, 4, 4, C.grey); outline(f);
}

function drawElectronics(f) {
  shadow(f); rect(f, 8, 9, 17, 13, C.darkGrey); rect(f, 10, 11, 13, 8, C.cyanDark); rect(f, 13, 13, 6, 3, C.cyan); rect(f, 11, 22, 4, 3, C.grey); rect(f, 18, 22, 4, 3, C.grey); setPixel(f, 22, 20, C.red); outline(f);
}

function drawScrapMetal(f) {
  shadow(f); rect(f, 8, 18, 17, 5, C.grey); line(f, 10, 18, 16, 9, C.darkGrey); line(f, 16, 9, 23, 17, C.grey); rect(f, 18, 13, 6, 3, C.darkGrey); rect(f, 11, 20, 7, 1, C.white); outline(f);
}

[
  drawPlasticBottle,
  drawPlasticBag,
  drawPlasticCup,
  drawStraw,
  drawSnackWrapper,
  drawCardboard,
  drawCan,
  drawBattery,
  drawMask,
  drawOrganic,
  drawCigarette,
  drawGlassBottle,
  drawStyrofoam,
  drawCable,
  drawElectronics,
  drawScrapMetal,
].forEach((draw, frame) => draw(frame));

if (fs.existsSync(outPath) && !fs.existsSync(backupPath)) {
  fs.copyFileSync(outPath, backupPath);
}

writePng(outPath, WIDTH, HEIGHT, pixels);
console.log("Readable 16-item trash spritesheet generated:", path.relative(process.cwd(), outPath));
