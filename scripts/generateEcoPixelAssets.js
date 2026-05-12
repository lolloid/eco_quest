const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT = path.join(process.cwd(), "public", "assets", "pixel", "ecoquest-pro");
const TILE = 32;
const TILE_COLS = 8;
const TILE_ROWS = 10;

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

function canvas(width, height, fill = null) {
  const pixels = new Uint8Array(width * height * 4);
  const c = {
    width,
    height,
    pixels,
    px(x, y, color, alpha = 255) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const i = (Math.floor(y) * width + Math.floor(x)) * 4;
      pixels[i] = (color >> 16) & 255;
      pixels[i + 1] = (color >> 8) & 255;
      pixels[i + 2] = color & 255;
      pixels[i + 3] = alpha;
    },
    rect(x, y, w, h, color, alpha = 255) {
      for (let yy = y; yy < y + h; yy += 1) {
        for (let xx = x; xx < x + w; xx += 1) this.px(xx, yy, color, alpha);
      }
    },
    border(x, y, w, h, color) {
      this.rect(x, y, w, 1, color);
      this.rect(x, y + h - 1, w, 1, color);
      this.rect(x, y, 1, h, color);
      this.rect(x + w - 1, y, 1, h, color);
    },
    dotPattern(x, y, w, h, colors, step = 4) {
      for (let yy = y; yy < y + h; yy += step) {
        for (let xx = x; xx < x + w; xx += step) {
          const index = Math.abs(xx * 3 + yy * 5) % colors.length;
          this.rect(xx, yy, 1 + ((xx + yy) % 2), 1, colors[index], 170);
        }
      }
    },
  };
  if (fill !== null) c.rect(0, 0, width, height, fill);
  return c;
}

function drawTile(c, gid, draw) {
  const index = gid - 1;
  const x = (index % TILE_COLS) * TILE;
  const y = Math.floor(index / TILE_COLS) * TILE;
  draw(x, y);
}

function makeTileset() {
  const c = canvas(TILE_COLS * TILE, TILE_ROWS * TILE, null);
  drawTile(c, 1, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x347b3a);
    c.dotPattern(x, y, TILE, TILE, [0x4fa84d, 0x2f6e34, 0x6fcf62], 4);
  });
  drawTile(c, 2, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x3f8e42);
    c.dotPattern(x, y, TILE, TILE, [0x63bd5a, 0x2f7635, 0x99d879], 3);
  });
  drawTile(c, 3, (x, y) => {
    c.rect(x, y, TILE, TILE, 0xa98254);
    c.dotPattern(x, y, TILE, TILE, [0xc09a62, 0x76543a, 0xd2b071], 5);
  });
  drawTile(c, 4, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x7a6649);
    c.dotPattern(x, y, TILE, TILE, [0x9c8057, 0x604d37, 0xb79a69], 5);
  });
  drawTile(c, 5, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x4a4c55);
    c.dotPattern(x, y, TILE, TILE, [0x63666f, 0x393b43], 6);
  });
  drawTile(c, 6, (x, y) => {
    c.rect(x, y, TILE, TILE, 0xd9bd75);
    c.dotPattern(x, y, TILE, TILE, [0xe8d393, 0xb99457], 5);
  });
  drawTile(c, 7, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x237eb3);
    c.rect(x + 2, y + 7, 18, 2, 0x5ac7e8, 190);
    c.rect(x + 11, y + 22, 16, 2, 0x5ac7e8, 160);
  });
  drawTile(c, 8, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x2b9bc7);
    c.rect(x + 8, y + 9, 18, 2, 0x7ce1ef, 185);
    c.rect(x + 2, y + 24, 14, 2, 0x7ce1ef, 160);
  });
  drawTile(c, 9, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x7ccfca);
    c.dotPattern(x, y, TILE, TILE, [0xa8efe5, 0x52a9a3], 6);
  });
  drawTile(c, 10, (x, y) => {
    c.rect(x + 13, y + 16, 6, 14, 0x67401f);
    c.rect(x + 5, y + 8, 22, 14, 0x236b34);
    c.rect(x + 9, y + 3, 15, 18, 0x348b43);
    c.rect(x + 13, y + 1, 7, 7, 0x5fb65b);
  });
  drawTile(c, 11, (x, y) => {
    c.rect(x + 13, y + 15, 7, 16, 0x6d4425);
    c.rect(x + 2, y + 10, 28, 13, 0x1e5f35);
    c.rect(x + 7, y + 3, 19, 14, 0x3b974c);
    c.rect(x + 1, y + 20, 30, 3, 0x123b23, 130);
  });
  drawTile(c, 12, (x, y) => {
    c.rect(x + 4, y + 18, 24, 9, 0x2c7439);
    c.rect(x + 8, y + 13, 16, 9, 0x4eaf51);
    c.rect(x + 18, y + 15, 3, 3, 0xf4d35e);
  });
  drawTile(c, 13, (x, y) => {
    c.rect(x + 8, y + 22, 4, 4, 0xf87171);
    c.rect(x + 18, y + 14, 4, 4, 0xf9d65c);
    c.rect(x + 23, y + 24, 4, 4, 0xb794f4);
    c.rect(x + 6, y + 25, 19, 2, 0x2b7439);
  });
  drawTile(c, 14, (x, y) => {
    c.rect(x + 8, y + 17, 16, 9, 0x818b8c);
    c.rect(x + 11, y + 14, 10, 5, 0xa8b1b3);
    c.rect(x + 8, y + 24, 16, 2, 0x3d4748);
  });
  drawTile(c, 15, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x9a6a48);
    c.border(x, y, TILE, TILE, 0x5f3927);
    c.rect(x + 4, y + 5, 24, 4, 0xb9855c);
  });
  drawTile(c, 16, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x315f43);
    for (let yy = 3; yy < 30; yy += 7) c.rect(x, y + yy, TILE, 2, 0x21472f);
    c.border(x, y, TILE, TILE, 0x17311f);
  });
  drawTile(c, 17, (x, y) => {
    c.rect(x + 9, y + 6, 14, 26, 0x4b3021);
    c.border(x + 9, y + 6, 14, 26, 0x24160e);
    c.rect(x + 19, y + 20, 2, 2, 0xd4af37);
  });
  drawTile(c, 18, (x, y) => {
    c.rect(x + 7, y + 8, 18, 14, 0x9be7ff);
    c.border(x + 7, y + 8, 18, 14, 0x2c4a70);
    c.rect(x + 15, y + 8, 2, 14, 0x2c4a70);
  });
  drawTile(c, 19, (x, y) => {
    c.rect(x, y + 8, TILE, 16, 0x815a35);
    c.rect(x, y + 13, TILE, 2, 0xb67b45);
    for (let xx = 4; xx < 32; xx += 8) c.rect(x + xx, y + 7, 3, 18, 0x4a2d1c);
  });
  drawTile(c, 20, (x, y) => {
    c.rect(x + 15, y + 8, 3, 20, 0x222831);
    c.rect(x + 11, y + 5, 11, 6, 0xf8e38b);
    c.rect(x + 10, y + 27, 13, 3, 0x222831);
  });
  drawTile(c, 21, (x, y) => {
    c.rect(x + 4, y + 13, 24, 5, 0x7f5235);
    c.rect(x + 5, y + 20, 22, 4, 0x8f5f3e);
    c.rect(x + 8, y + 23, 3, 6, 0x3d291f);
    c.rect(x + 21, y + 23, 3, 6, 0x3d291f);
  });
  drawTile(c, 22, (x, y) => {
    c.rect(x + 14, y + 14, 4, 16, 0x5c3a1e);
    c.rect(x + 4, y + 7, 24, 11, 0xb7793d);
    c.border(x + 4, y + 7, 24, 11, 0x4a2d1c);
  });
  drawTile(c, 23, (x, y) => {
    c.rect(x + 5, y + 7, 22, 22, 0x1c6b55);
    c.border(x + 5, y + 7, 22, 22, 0x0d3328);
    c.rect(x + 10, y + 12, 12, 3, 0xa7f3d0);
    c.rect(x + 10, y + 18, 12, 3, 0xa7f3d0);
  });
  drawTile(c, 24, (x, y) => {
    c.rect(x + 6, y + 9, 20, 18, 0x3b4656);
    c.border(x + 6, y + 9, 20, 18, 0x111827);
    c.rect(x + 10, y + 5, 12, 4, 0x6b7280);
  });
  drawTile(c, 25, (x, y) => {
    for (let xx = 2; xx < 32; xx += 8) c.rect(x + xx, y + 8, 3, 18, 0xffffff);
    c.rect(x, y + 13, TILE, 3, 0xffffff);
  });
  drawTile(c, 26, (x, y) => {
    c.rect(x, y, TILE, TILE, 0xd2b48c);
    c.border(x, y, TILE, TILE, 0x7d5f3f);
    c.rect(x + 3, y + 3, 26, 4, 0xf3d7a6);
  });
  drawTile(c, 27, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x1f7a4d);
    c.rect(x, y + 9, TILE, 3, 0x0f5132);
    c.rect(x, y + 20, TILE, 3, 0x0f5132);
  });
  drawTile(c, 28, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x793c3c);
    c.rect(x, y + 8, TILE, 3, 0x4e2424);
    c.rect(x, y + 19, TILE, 3, 0x4e2424);
  });
  drawTile(c, 29, (x, y) => {
    c.rect(x, y, TILE, TILE, 0xb7a05f);
    c.rect(x, y + 20, TILE, 12, 0x2b9bc7);
    c.rect(x, y + 18, TILE, 3, 0xf2dc99);
  });
  drawTile(c, 30, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x3b82f6);
    c.dotPattern(x, y, TILE, TILE, [0x60a5fa, 0x1e40af], 5);
  });
  drawTile(c, 31, (x, y) => {
    c.rect(x + 5, y + 5, 22, 22, 0x0f3324);
    c.rect(x + 7, y + 7, 18, 18, 0x113f2a);
    c.rect(x + 9, y + 17, 14, 3, 0x86efac);
  });
  drawTile(c, 32, (x, y) => {
    c.rect(x + 6, y + 7, 20, 18, 0x111827);
    c.rect(x + 9, y + 10, 14, 12, 0x22c55e);
    c.rect(x + 12, y + 13, 8, 2, 0xdcfce7);
  });
  drawTile(c, 33, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    for (let i = 0; i < 18; i += 1) {
      const px = (i * 7 + 3) % 30;
      const py = (i * 11 + 5) % 30;
      c.rect(x + px, y + py, 2, 5, i % 2 ? 0x69c65f : 0x3d9548, 210);
      c.rect(x + px + 1, y + py + 2, 1, 3, 0x247235, 210);
    }
  });
  drawTile(c, 34, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    for (let i = 0; i < 7; i += 1) {
      const px = (i * 9 + 5) % 28;
      const py = (i * 13 + 8) % 26;
      c.rect(x + px, y + py, 3, 2, 0x8bd56b, 230);
      c.rect(x + px + 1, y + py - 1, 2, 4, 0x5aad4f, 230);
    }
  });
  drawTile(c, 35, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 3, y + 22, 26, 3, 0x255a32, 200);
    c.rect(x + 6, y + 17, 4, 9, 0x6abd59, 230);
    c.rect(x + 13, y + 14, 3, 12, 0x88d76c, 230);
    c.rect(x + 21, y + 16, 4, 10, 0x55a84d, 230);
  });
  drawTile(c, 36, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    for (let i = 0; i < 6; i += 1) {
      const px = (i * 6 + 4) % 25;
      const py = 12 + ((i * 5) % 13);
      c.rect(x + px, y + py, 3, 3, i % 3 === 0 ? 0xffd166 : i % 3 === 1 ? 0xef7aa3 : 0xb8f7d4, 240);
      c.rect(x + px + 1, y + py + 3, 1, 4, 0x3b8f45, 220);
    }
  });
  drawTile(c, 37, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 3, y + 17, 26, 8, 0x07130b, 82);
    c.rect(x + 7, y + 14, 18, 12, 0x07130b, 60);
  });
  drawTile(c, 38, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 1, y + 20, 30, 8, 0x07130b, 75);
    c.rect(x + 6, y + 16, 22, 8, 0x07130b, 45);
  });
  drawTile(c, 39, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x, y + 14, TILE, 9, 0x5d4835, 245);
    c.rect(x, y + 23, TILE, 5, 0x34261e, 245);
    c.rect(x + 4, y + 13, 7, 3, 0x91714f, 245);
    c.rect(x + 18, y + 12, 9, 3, 0x91714f, 245);
  });
  drawTile(c, 40, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
  });
  drawTile(c, 41, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 8, y + 8, 16, 16, 0xfde68a, 28);
    c.rect(x + 11, y + 11, 10, 10, 0xfef3c7, 50);
    c.rect(x + 14, y + 14, 4, 4, 0xfffbeb, 85);
  });
  drawTile(c, 42, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 2, y + 7, 28, 11, 0x164f2d, 250);
    c.rect(x + 6, y + 1, 21, 13, 0x2d8a44, 250);
    c.rect(x + 11, y + 2, 9, 5, 0x70c768, 245);
    c.rect(x + 1, y + 18, 30, 4, 0x0b2f1d, 100);
  });
  drawTile(c, 43, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 5, y, 21, TILE, 0x8ee7ff, 210);
    c.rect(x + 8, y + 4, 4, 23, 0xffffff, 130);
    c.rect(x + 18, y + 8, 3, 19, 0xcffafe, 150);
  });
  drawTile(c, 44, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x, y + 22, TILE, 7, 0x244d33, 240);
    c.rect(x, y + 27, TILE, 3, 0x173723, 240);
    c.rect(x + 4, y + 21, 8, 3, 0x5c7c4b, 230);
    c.rect(x + 19, y + 20, 7, 3, 0x5c7c4b, 230);
  });
  drawTile(c, 45, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x, y + 6, TILE, 5, 0x6f432a, 245);
    c.rect(x, y + 20, TILE, 5, 0x6f432a, 245);
    for (let xx = 2; xx < 32; xx += 8) c.rect(x + xx, y + 3, 3, 25, 0x3d2418, 245);
  });
  drawTile(c, 46, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 11, y + 9, 4, 4, 0xf0abfc, 230);
    c.rect(x + 17, y + 9, 4, 4, 0xf0abfc, 230);
    c.rect(x + 15, y + 12, 2, 7, 0x334155, 230);
  });
  drawTile(c, 47, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 8, y + 20, 16, 5, 0x395b35, 220);
    c.rect(x + 10, y + 14, 12, 9, 0x7fbf55, 240);
    c.rect(x + 13, y + 10, 6, 6, 0xffe08a, 240);
  });
  drawTile(c, 48, (x, y) => {
    c.rect(x, y, TILE, TILE, 0x000000, 0);
    c.rect(x + 4, y + 4, 24, 24, 0x07130b, 38);
    c.rect(x + 9, y + 9, 14, 14, 0x07130b, 52);
  });
  writePng(path.join(OUT, "tilesets", "ecoquest_tiles.png"), c.width, c.height, c.pixels);
}

function makeTrashSprites() {
  const c = canvas(10 * 32, 32, null);
  const at = (frame, draw) => draw(frame * 32, 0);
  at(0, (x, y) => { c.rect(x + 13, y + 5, 7, 4, 0x1d4ed8); c.rect(x + 10, y + 9, 13, 18, 0x60a5fa); c.rect(x + 12, y + 11, 9, 12, 0xdbeafe, 120); c.border(x + 10, y + 9, 13, 18, 0x1e3a8a); });
  at(1, (x, y) => { c.rect(x + 9, y + 7, 14, 20, 0xef4444); c.rect(x + 9, y + 7, 14, 3, 0xfca5a5); c.rect(x + 10, y + 15, 12, 5, 0xffffff); c.border(x + 9, y + 7, 14, 20, 0x7f1d1d); });
  at(2, (x, y) => { c.rect(x + 7, y + 10, 18, 15, 0xb7793d); c.border(x + 7, y + 10, 18, 15, 0x633814); c.rect(x + 9, y + 12, 14, 2, 0xe2b36b); });
  at(3, (x, y) => { c.rect(x + 8, y + 11, 17, 13, 0xf4ead2); c.rect(x + 10, y + 9, 13, 5, 0xfffbeb); c.border(x + 8, y + 11, 17, 13, 0xa08a65); c.rect(x + 13, y + 16, 7, 1, 0x9ca3af); });
  at(4, (x, y) => { c.rect(x + 8, y + 10, 16, 17, 0xc4b5fd); c.rect(x + 10, y + 7, 4, 6, 0xe9d5ff); c.rect(x + 18, y + 7, 4, 6, 0xe9d5ff); c.border(x + 8, y + 10, 16, 17, 0x6d28d9); });
  at(5, (x, y) => { c.rect(x + 12, y + 5, 8, 5, 0x0f766e); c.rect(x + 10, y + 10, 13, 18, 0x5eead4, 210); c.border(x + 10, y + 10, 13, 18, 0x115e59); c.rect(x + 14, y + 13, 4, 11, 0xccfbf1, 160); });
  at(6, (x, y) => { c.rect(x + 11, y + 12, 10, 5, 0xfacc15); c.rect(x + 8, y + 17, 14, 4, 0xf59e0b); c.rect(x + 17, y + 20, 7, 4, 0xfcd34d); c.rect(x + 10, y + 13, 3, 2, 0x854d0e); });
  at(7, (x, y) => { c.rect(x + 7, y + 8, 18, 18, 0x111827); c.rect(x + 11, y + 12, 10, 10, 0x374151); c.rect(x + 14, y + 15, 4, 4, 0x0f172a, 0); });
  at(8, (x, y) => { c.rect(x + 7, y + 9, 18, 15, 0xf8fafc); c.border(x + 7, y + 9, 18, 15, 0xcbd5e1); c.rect(x + 12, y + 14, 8, 1, 0x94a3b8); });
  at(9, (x, y) => { for (let i = 0; i < 6; i += 1) { c.rect(x + 7 + i * 3, y + 9, 1, 18, 0x5eead4); c.rect(x + 6, y + 10 + i * 3, 20, 1, 0x2dd4bf); } c.border(x + 6, y + 8, 21, 20, 0x0f766e); });
  writePng(path.join(OUT, "sprites", "trash_items.png"), c.width, c.height, c.pixels);
}

function makeNpcSprites() {
  const names = [
    [0x4f8bd8, 0xd1d5db],
    [0xf59e0b, 0x60a5fa],
    [0x16a34a, 0x854d0e],
    [0x0ea5e9, 0xf97316],
    [0xa855f7, 0xfacc15],
    [0x22c55e, 0x78350f],
    [0xef4444, 0x334155],
    [0xf97316, 0x1f2937],
    [0x14b8a6, 0x475569],
  ];
  const c = canvas(4 * 32, names.length * 32, null);
  names.forEach(([shirt, hair], row) => {
    for (let frame = 0; frame < 4; frame += 1) {
      const x = frame * 32;
      const y = row * 32;
      const bob = frame % 2;
      c.rect(x + 10, y + 4 + bob, 12, 8, hair);
      c.rect(x + 11, y + 11 + bob, 10, 8, 0xf1c27d);
      c.rect(x + 9, y + 19 + bob, 14, 8, shirt);
      c.rect(x + 8, y + 27, 6, 4, 0x1f2937);
      c.rect(x + 19, y + 27, 6, 4, 0x1f2937);
      c.rect(x + 13, y + 14 + bob, 2, 2, 0x111827);
      c.rect(x + 18, y + 14 + bob, 2, 2, 0x111827);
    }
  });
  writePng(path.join(OUT, "sprites", "npcs.png"), c.width, c.height, c.pixels);
}

function makeStationSprites() {
  const c = canvas(2 * 64, 64, null);
  c.rect(8, 8, 48, 44, 0x14532d);
  c.border(8, 8, 48, 44, 0x052e16);
  c.rect(18, 18, 28, 6, 0xbbf7d0);
  c.rect(18, 30, 28, 6, 0xbbf7d0);
  c.rect(23, 42, 18, 5, 0x22c55e);
  c.rect(72, 14, 48, 39, 0x334155);
  c.border(72, 14, 48, 39, 0x0f172a);
  c.rect(80, 8, 32, 8, 0x64748b);
  c.rect(88, 27, 16, 16, 0xfbbf24);
  writePng(path.join(OUT, "sprites", "stations.png"), c.width, c.height, c.pixels);
}

function makeAnimalSprites() {
  const c = canvas(2 * 32, 32, null);
  c.rect(7, 12, 14, 8, 0xf8fafc);
  c.rect(18, 9, 5, 5, 0xf8fafc);
  c.rect(10, 20, 3, 4, 0x64748b);
  c.rect(18, 20, 3, 4, 0x64748b);
  c.rect(39, 14, 17, 7, 0x92400e);
  c.rect(51, 10, 7, 6, 0xb45309);
  c.rect(39, 21, 3, 3, 0x78350f);
  c.rect(50, 21, 3, 3, 0x78350f);
  writePng(path.join(OUT, "sprites", "animals.png"), c.width, c.height, c.pixels);
}

const objectProperties = (props) =>
  Object.entries(props).map(([name, value]) => ({
    name,
    type: typeof value === "number" ? "float" : "string",
    value,
  }));

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

function fill(layer, x, y, w, h, gid) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      if (xx >= 0 && yy >= 0 && xx < layer.width && yy < layer.height) {
        layer.data[yy * layer.width + xx] = gid;
      }
    }
  }
}

function put(layer, x, y, gid) {
  if (x >= 0 && y >= 0 && x < layer.width && y < layer.height) layer.data[y * layer.width + x] = gid;
}

function makeMap() {
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

  fill(ground, 55, 33, 22, 13, 6);
  fill(ground, 51, 39, 29, 11, 6);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if ((x * 17 + y * 23) % 9 === 0) put(grassDetail, x, y, 33);
      if ((x * 13 + y * 19) % 23 === 0) put(grassDetail, x, y, 34);
      if ((x * 7 + y * 31) % 37 === 0) put(grassDetail, x, y, 36);
    }
  }
  fill(grassDetail, 8, 34, 16, 6, 35);
  fill(grassDetail, 52, 8, 17, 8, 35);
  for (let x = 8; x < 24; x += 3) {
    put(grassDetail, x, 38, 47);
    put(grassDetail, x + 1, 39, 36);
  }
  fill(paths, 27, 0, 4, height, 3);
  fill(paths, 0, 21, width, 3, 3);
  fill(paths, 11, 33, 44, 3, 3);
  fill(paths, 45, 20, 3, 25, 3);
  fill(paths, 59, 29, 3, 14, 3);
  fill(paths, 34, 10, 18, 2, 3);
  fill(paths, 9, 11, 15, 2, 3);
  fill(water, 3, 28, 25, 7, 7);
  fill(water, 4, 35, 18, 3, 8);
  fill(water, 52, 42, 28, 8, 7);
  fill(water, 50, 39, 9, 4, 29);
  fill(decorations, 3, 27, 25, 1, 44);
  fill(decorations, 4, 38, 18, 1, 44);
  fill(decorations, 52, 41, 28, 1, 44);
  fill(topObjects, 53, 40, 3, 3, 43);
  fill(collision, 3, 28, 25, 10, 40);
  fill(collision, 52, 42, 28, 8, 40);
  fill(buildings, 35, 5, 8, 4, 26);
  fill(shadows, 35, 9, 8, 2, 38);
  fill(buildings, 35, 4, 8, 1, 28);
  fill(buildings, 38, 8, 1, 1, 17);
  fill(buildings, 36, 6, 1, 1, 18);
  fill(buildings, 41, 6, 1, 1, 18);
  fill(collision, 35, 4, 8, 5, 40);
  fill(buildings, 35, 34, 9, 4, 15);
  fill(shadows, 35, 38, 9, 2, 38);
  fill(buildings, 35, 33, 9, 1, 27);
  fill(buildings, 39, 37, 1, 1, 17);
  fill(buildings, 36, 35, 1, 1, 18);
  fill(buildings, 42, 35, 1, 1, 18);
  fill(collision, 35, 33, 9, 5, 40);
  fill(buildings, 63, 10, 7, 4, 15);
  fill(shadows, 63, 14, 7, 2, 38);
  fill(buildings, 63, 9, 7, 1, 16);
  fill(buildings, 66, 13, 1, 1, 17);
  fill(collision, 63, 9, 7, 5, 40);
  fill(buildings, 62, 30, 8, 4, 26);
  fill(shadows, 62, 34, 8, 2, 38);
  fill(buildings, 62, 29, 8, 1, 28);
  fill(buildings, 65, 33, 1, 1, 17);
  fill(collision, 62, 29, 8, 5, 40);
  fill(buildings, 9, 8, 8, 4, 15);
  fill(shadows, 9, 12, 8, 2, 38);
  fill(buildings, 9, 7, 8, 1, 27);
  fill(buildings, 12, 11, 1, 1, 17);
  fill(collision, 9, 7, 8, 5, 40);
  fill(decorations, 13, 31, 5, 1, 19);
  fill(collision, 13, 31, 5, 1, 0);

  for (let x = 2; x < width - 2; x += 5) {
    put(decorations, x, 2 + ((x * 7) % 7), x % 2 ? 10 : 11);
    put(shadows, x, 3 + ((x * 7) % 7), 37);
    put(topObjects, x, 1 + ((x * 7) % 7), 42);
    put(collision, x, 2 + ((x * 7) % 7), 40);
  }
  for (let x = 50; x < 76; x += 4) {
    for (let y = 4; y < 19; y += 5) {
      put(decorations, x, y, (x + y) % 2 ? 10 : 11);
      put(shadows, x, y + 1, 37);
      put(topObjects, x, y - 1, 42);
      put(collision, x, y, 40);
    }
  }
  for (let x = 2; x < 76; x += 6) {
    put(decorations, x, 18 + ((x * 3) % 2), 12);
    put(decorations, x + 2, 25 + ((x * 5) % 3), 13);
    put(decorations, x + 1, 39 + ((x * 3) % 4), 14);
  }
  [
    [19, 15, 21], [24, 20, 20], [31, 20, 22], [49, 22, 20], [53, 24, 21],
    [57, 34, 22], [72, 28, 24], [44, 38, 23], [45, 35, 24], [18, 24, 31],
    [70, 16, 25], [58, 29, 25], [34, 13, 25],
  ].forEach(([x, y, gid]) => put(decorations, x, y, gid));
  [
    [24, 20], [49, 22], [70, 16], [34, 13], [53, 24],
  ].forEach(([x, y]) => put(lighting, x, y, 41));
  [
    [18, 18], [22, 18], [62, 24], [66, 24], [56, 35], [60, 35], [17, 31],
  ].forEach(([x, y]) => put(topObjects, x, y, 46));

  const trash = [
    ["plastic_bottle", "plastic", "starter_park", 770, 570],
    ["crumpled_paper", "paper", "starter_park", 610, 485],
    ["banana_peel", "organic", "starter_park", 705, 685],
    ["cardboard", "paper", "school", 1255, 395],
    ["plastic_bag", "plastic", "school", 1440, 345],
    ["soda_can", "metal", "school", 1340, 520],
    ["glass_bottle", "glass", "river", 505, 920],
    ["fishing_net", "plastic", "river", 670, 1030],
    ["styrofoam", "plastic", "river", 830, 890],
    ["banana_peel", "organic", "forest", 1705, 350],
    ["crumpled_paper", "paper", "forest", 1875, 525],
    ["glass_bottle", "glass", "forest", 2050, 455],
    ["soda_can", "metal", "recycling", 1165, 1260],
    ["plastic_bottle", "plastic", "recycling", 1360, 1215],
    ["plastic_bag", "plastic", "beach", 1840, 1220],
    ["glass_bottle", "glass", "beach", 2050, 1305],
    ["old_tire", "plastic", "beach", 2230, 1370],
    ["cardboard", "paper", "city", 1570, 745],
    ["styrofoam", "plastic", "city", 1685, 820],
    ["soda_can", "metal", "city", 1475, 690],
    ["organic_waste", "organic", "city", 1940, 760],
    ["fishing_net", "plastic", "beach", 2320, 1450],
  ].map(([variant, trashType, areaId, x, y], index) => ({
    id: index + 1,
    name: variant,
    point: true,
    type: "trash",
    x,
    y,
    properties: objectProperties({ variant, trashType, areaId, rarity: index % 7 === 0 ? "uncommon" : "common" }),
  }));

  const npcs = [
    ["prof_eco", "Prof. Eco", "starter_park", 510, 420, 0],
    ["guru_maya", "Guru Maya", "school", 1280, 430, 1],
    ["ranger_adi", "Ranger Adi", "forest", 1830, 410, 2],
    ["nelayan_jaya", "Nelayan", "beach", 1990, 1225, 3],
    ["lina", "Lina", "school", 1450, 520, 4],
    ["park_guard", "Penjaga Taman", "starter_park", 710, 610, 5],
    ["cleaner_bima", "Pak Bima", "city", 1550, 825, 6],
    ["vendor_sari", "Bu Sari", "city", 1745, 725, 7],
    ["dr_nara", "Dr. Nara", "river", 720, 940, 8],
  ].map(([npcId, label, areaId, x, y, frame], index) => ({
    id: index + 101,
    name: label,
    point: true,
    type: "npc",
    x,
    y,
    properties: objectProperties({ npcId, areaId, frame }),
  }));

  const stations = [
    ["eco_center", "Eco Center", "recycling", 1248, 1200, 0, "plastic,paper,metal,glass"],
    ["city_tps", "TPS Kota", "city", 1488, 805, 1, "organic,plastic,paper,metal,glass"],
  ].map(([stationId, label, areaId, x, y, frame, accepts], index) => ({
    id: index + 201,
    name: label,
    point: true,
    type: "station",
    x,
    y,
    properties: objectProperties({ stationId, areaId, frame, accepts }),
  }));

  const areas = [
    ["starter_park", "Taman Kota", 160, 160, 820, 570],
    ["school", "Sekolah Hijau", 1050, 150, 610, 470],
    ["forest", "Hutan Kecil", 1580, 90, 770, 600],
    ["city", "Kota Kecil", 1390, 600, 760, 360],
    ["river", "Sungai", 90, 840, 900, 400],
    ["recycling", "Recycle Area", 1060, 1040, 520, 360],
    ["beach", "Pantai", 1720, 1060, 720, 460],
    ["lake", "Danau", 1600, 1280, 860, 320],
    ["garden", "Kebun Komunitas", 260, 1120, 620, 320],
    ["industry", "Industri Kecil", 2040, 560, 420, 360],
    ["camping", "Camping Ground", 1650, 150, 560, 360],
  ].map(([areaId, label, x, y, w, h], index) => ({
    id: index + 301,
    name: label,
    type: "area",
    x,
    y,
    width: w,
    height: h,
    properties: objectProperties({ areaId }),
  }));

  const layers = [
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
    { id: 0, name: "areas", type: "objectgroup", visible: true, opacity: 1, x: 0, y: 0, objects: areas },
    { id: 0, name: "trash", type: "objectgroup", visible: true, opacity: 1, x: 0, y: 0, objects: trash },
    { id: 0, name: "npcs", type: "objectgroup", visible: true, opacity: 1, x: 0, y: 0, objects: npcs },
    { id: 0, name: "stations", type: "objectgroup", visible: true, opacity: 1, x: 0, y: 0, objects: stations },
    {
      id: 0,
      name: "ambient",
      type: "objectgroup",
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      objects: [
        { id: 501, name: "bird", point: true, type: "animal", x: 820, y: 315, properties: objectProperties({ frame: 0 }) },
        { id: 502, name: "cat", point: true, type: "animal", x: 1560, y: 705, properties: objectProperties({ frame: 1 }) },
      ],
    },
    {
      id: 0,
      name: "player_spawn",
      type: "objectgroup",
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      objects: [{ id: 601, name: "spawn", point: true, type: "spawn", x: 760, y: 650 }],
    },
  ].map((layer, index) => ({ ...layer, id: index + 1 }));

  const map = {
    compressionlevel: -1,
    height,
    infinite: false,
    layers,
    nextlayerid: layers.length + 1,
    nextobjectid: 700,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.10.2",
    tileheight: TILE,
    tilewidth: TILE,
    type: "map",
    version: "1.10",
    width,
    tilesets: [
      {
        columns: TILE_COLS,
        firstgid: 1,
        image: "../tilesets/ecoquest_tiles.png",
        imageheight: TILE_ROWS * TILE,
        imagewidth: TILE_COLS * TILE,
        margin: 0,
        name: "ecoquest_tiles",
        spacing: 0,
        tilecount: TILE_COLS * TILE_ROWS,
        tileheight: TILE,
        tilewidth: TILE,
        tiles: [
          { id: 6, properties: objectProperties({ animatedWater: "frameA" }) },
          { id: 7, properties: objectProperties({ animatedWater: "frameB" }) },
          { id: 39, properties: objectProperties({ collides: true }) },
        ],
      },
    ],
  };

  const filePath = path.join(OUT, "maps", "eco_world.json");
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
}

makeTileset();
makeTrashSprites();
makeNpcSprites();
makeStationSprites();
makeAnimalSprites();
makeMap();

console.log(`EcoQuest pixel RPG assets generated in ${OUT}`);
