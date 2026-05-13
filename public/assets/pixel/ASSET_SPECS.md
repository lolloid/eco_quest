# 🌿 SPESIFIKASI ASSET PIXEL ART — PixelTerra

## 📁 File: `public/assets/pixel/character/hero.png`

### Deskripsi
Sprite sheet karakter utama (EcoWarrior) dalam gaya pixel art 16-bit.

### Spesifikasi
- **Dimensi total**: 128 x 128 piksel
- **Per frame**: 32 x 32 piksel
- **Grid**: 4 kolom × 4 baris
- **Format**: PNG 32-bit (dengan transparansi)
- **Warna**: Palet terbatas (max 16 warna)

### Layout Sprite Sheet
```
Row 0 (y=0):    Walk Down  — Frame 0, 1, 2, 3
Row 1 (y=32):   Walk Left  — Frame 0, 1, 2, 3
Row 2 (y=64):   Walk Right — Frame 0, 1, 2, 3
Row 3 (y=96):   Walk Up    — Frame 0, 1, 2, 3
```

### Palet Warna Karakter
| Bagian         | Hex Color   | Deskripsi         |
| -------------- | ----------- | ----------------- |
| Kulit          | `#F5DEB3`   | Wheat             |
| Rambut         | `#2C1810`   | Coklat gelap      |
| Baju           | `#E74C3C`   | Merah (hero vest) |
| Celana         | `#2C3E50`   | Navy              |
| Sepatu         | `#5C3A1E`   | Coklat            |
| Outline        | `#1A1A1A`   | Hitam             |
| Mata           | `#000000`   | Hitam             |
| Aksen hijau    | `#10B981`   | Eco green badge   |

### Cara Membuat di Piskel
1. Buka https://www.piskelapp.com/
2. Set canvas ke 128 × 128 piksel
3. Aktifkan grid 32 × 32
4. Gambar frame idle di posisi (0,0) — karakter hadap bawah
5. Copy dan modifikasi untuk frame animasi berjalan
6. Ulangi untuk arah kiri, kanan, dan atas
7. Export sebagai PNG sprite sheet

---

## 📁 File: `public/assets/pixel/tilesets/tileset_kota.png`

### Deskripsi
Tileset untuk peta kota PixelTerra, berisi tile dasar untuk environment.

### Spesifikasi
- **Dimensi total**: 128 x 64 piksel
- **Per tile**: 32 x 32 piksel
- **Grid**: 4 kolom × 2 baris = 8 tiles
- **Format**: PNG 32-bit (tanpa transparansi)

### Layout Tiles
```
(0,0)  Tile 1: Rumput hijau (grass)
(32,0) Tile 2: Tanah/jalan setapak (dirt path)
(64,0) Tile 3: Jalan aspal (road)
(96,0) Tile 4: Gedung/bangunan (building wall)

(0,32)  Tile 5: Sampah botol (trash - bottle)  ← COLLIDER
(32,32) Tile 6: Sampah kaleng (trash - can)     ← COLLIDER
(64,32) Tile 7: Air/kolam (water)
(96,32) Tile 8: Pohon (tree)
```

### Palet Warna Tileset
| Tile           | Hex Colors                    |
| -------------- | ----------------------------- |
| Rumput         | `#2D5A27`, `#3A6B32`          |
| Jalan tanah    | `#8B7355`, `#A0845E`          |
| Jalan aspal    | `#4A4A4A`, `#5C5C5C`          |
| Gedung         | `#4A6FA5`, `#2C4A70`          |
| Sampah botol   | `#3498DB`, `#2980B9` (biru)   |
| Sampah kaleng  | `#E74C3C`, `#C0392B` (merah)  |
| Air            | `#3498DB`, `#5DADE2`          |
| Pohon          | `#1A8A1A`, `#5C3A1E` (trunk) |

### Cara Membuat di Piskel
1. Buat canvas 128 × 64 piksel
2. Aktifkan grid 32 × 32
3. Gambar setiap tile di posisinya
4. Gunakan pixel art style (no anti-aliasing)
5. Export sebagai PNG

---

## Catatan
- Game saat ini berjalan dengan **grafis prosedural** (programmatic) tanpa memerlukan file gambar
- File gambar ini opsional dan digunakan jika ingin tampilan yang lebih polished
- Jika ingin menggunakan sprite sheet, modifikasi `GameCanvas.jsx` untuk me-load asset tersebut
