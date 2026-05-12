# EcoQuest Play Game Redesign Audit

## Status Implementasi Saat Ini

Play Game sudah dipindahkan dari world procedural menuju workflow profesional:

Tiled-style JSON tilemap -> PNG tileset -> Phaser Tilemap -> React overlay UI.

File utama:

- `src/components/GameCanvas.jsx`
- `src/features/game/ecoWorldData.js`
- `src/features/game/events/gameEventBus.js`
- `scripts/generateEcoPixelAssets.js`
- `public/assets/pixel/ecoquest-pro/maps/eco_world.json`
- `public/assets/pixel/ecoquest-pro/tilesets/ecoquest_tiles.png`

## Audit Sistem Lama

Masalah utama yang ditemukan:

- Map lama digambar langsung dengan Phaser primitive seperti rectangle, circle, dan graphics.
- Game world, interaction, API sync, dialog, UI state, dan scene lifecycle bercampur dalam satu file besar.
- Interaction sampah dan NPC sebelumnya rawan gagal karena bergantung pada overlap/trigger yang kurang jelas.
- Inventory/world status tidak selalu terasa realtime karena UI tidak selalu reload setelah action.
- NPC belum sepenuhnya mengikuti collision map.
- Asset visual masih belum mencapai kualitas artist-made pixel RPG.
- Tiled workflow belum menjadi sumber utama world data.

## Perbaikan Yang Sudah Masuk

- Phaser memakai `tilemapTiledJSON`.
- Map menggunakan layered tilemap: `ground`, `paths`, `water`, `buildings`, `decorations`, `collision`.
- Object layer tersedia untuk `areas`, `trash`, `npcs`, `stations`, `ambient`, dan `player_spawn`.
- Interaction memakai `interactionZone` + `physics.overlap` + tombol `E`.
- Sampah masuk inventory melalui `/api/game/events`.
- Recycle station memakai `/api/recycle`.
- Inventory reload melalui `/api/inventory`.
- World status reload melalui `/api/world`.
- React overlay dan Phaser world dipisahkan.
- Event bus kecil tersedia di `src/features/game/events/gameEventBus.js`.
- Cleanup memakai `destroy(true)` dan container `replaceChildren()`.
- Config Phaser memakai `pixelArt`, `antialias: false`, dan `roundPixels`.

## Tilemap Structure

Map saat ini:

- Ukuran: 80 x 50 tile.
- Tile size: 32 x 32.
- World size: 2560 x 1600 px.
- Area object layer: 11 area.
- NPC object layer: 9 NPC.
- Trash object layer: 22 trash items.
- Station object layer: 2 station.
- Visual tile layers: `ground`, `grass_detail`, `paths`, `shadows`, `water`, `buildings`, `decorations`, `top_objects`, `lighting`.

Area:

- Taman Kota
- Sekolah Hijau
- Sungai
- Pantai
- Hutan Kecil
- Eco Center / Recycle Area
- TPS Kota
- Danau
- Kebun Komunitas
- Industri Kecil
- Camping Ground

## Architecture Target Berikutnya

Struktur ideal berikutnya:

```txt
src/features/game/
  config/
    assets.js
    constants.js
  events/
    gameEventBus.js
  scenes/
    BootScene.js
    PreloadScene.js
    EcoWorldScene.js
  systems/
    InteractionManager.js
    CollisionManager.js
    InventorySync.js
    RecycleSystem.js
    WorldStatusSystem.js
    NpcSystem.js
    DialogSystem.js
    CameraSystem.js
  ui/
    GameOverlay.jsx
    PlayerHud.jsx
    QuestTracker.jsx
    InventoryModal.jsx
    DialogBox.jsx
  tilemaps/
    eco_world.json
  assets/
    tilesets/
    sprites/
    audio/
```

## Tiled Workflow

Workflow produksi yang disarankan:

1. Buat map di Tiled Map Editor.
2. Gunakan tile size konsisten, idealnya 16x16 atau 32x32.
3. Buat layer minimal:
   - `ground`
   - `paths`
   - `water`
   - `buildings`
   - `decorations_back`
   - `decorations_front`
   - `collision`
   - `trash`
   - `npcs`
   - `stations`
   - `areas`
   - `player_spawn`
4. Export ke JSON.
5. Simpan PNG tileset di `public/assets/pixel/...`.
6. Load di Phaser dengan `this.load.tilemapTiledJSON`.
7. Semua interaksi berasal dari object layer, bukan koordinat hardcoded.

## Asset Pipeline

Asset generator saat ini hanya bootstrap agar sistem tilemap berjalan. Untuk kualitas lomba/startup MVP, ganti dengan asset artist-made:

- Terrain tileset: grass, dirt, stone path, beach, water, bridge.
- Building tileset: school, eco center, homes, recycle facility.
- Props: trees, flowers, fences, signs, benches, bins, lamps.
- Characters: player + NPC dengan idle/walk 4 arah.
- Trash sprites: 10 jenis sampah dengan ikon unik.
- UI pack: pixel frame, dialog box, icons.

## Art Direction Notes

Target visual EcoQuest:

- Palette: natural green, warm soil, soft amber lighting, clean blue water.
- Depth: `shadows` layer berada di bawah bangunan/dekorasi, `top_objects` berada di atas player untuk efek overlap pohon.
- Lighting: `lighting` layer memakai additive blend di Phaser.
- World state: area kotor diberi tint hangat/kusam, area bersih kembali ke warna natural.
- Rule: gameplay runtime tidak menggambar environment dengan Phaser primitive. Semua tile visual berasal dari PNG tileset dan Tiled JSON.

## Asset Recommendation

Rekomendasi awal:

- OpenGameArt RPG Tileset by russpuppy, CC0.
- OpenGameArt Outdoor 32x32 tileset by Buch, CC0.
- OpenGameArt top down grass, beach and water tileset, CC0.
- LimeZu Modern Interiors, cocok untuk sekolah/interior, free/paid license tersedia.
- Kenney Monochrome RPG, CC0, cocok untuk prototyping legal-clean.
- Ninja Adventure asset pack, cocok untuk top-down RPG lengkap.
- MadChirpy RPG Adventure, paid low-cost pack dengan village/forest/NPC.

Selalu cek license di halaman asset sebelum dimasukkan ke repo production.

## Gameplay Systems

Interaction:

- Player memiliki circular-ish interaction zone.
- Saat target masuk radius, React menampilkan prompt `E`.
- Priority target: trash -> NPC -> station.

Trash:

- Trash berasal dari object layer `trash`.
- Setiap object punya `variant`, `trashType`, `areaId`, dan `rarity`.
- Pickup mengirim action server-side `COLLECT_TRASH`.

Recycle:

- Station berasal dari object layer `stations`.
- Setiap station punya `accepts`.
- Jika inventory punya item cocok, `/api/recycle` memproses reward.
- Jika item tidak cocok, UI menampilkan penalty feedback.

NPC:

- NPC berasal dari object layer `npcs`.
- Setiap NPC punya `npcId`, `areaId`, dan frame sprite.
- Dialog berasal dari `NPC_DIALOGS`.
- NPC wandering memakai velocity pendek dan collision layer.

World Status:

- `/api/world` menjadi sumber data.
- Cleanliness mempengaruhi tint world dan water.
- Recycle meningkatkan cleanliness.

## Testing Checklist

Sudah diverifikasi:

- `npm test`
- `npm run build`
- route `/`
- route asset tilemap JSON
- route asset PNG tileset
- route `/game` dengan session test dari sisi HTTP

Checklist manual di browser:

- Tidak ada duplicate canvas setelah refresh beberapa kali.
- Player bisa bergerak dengan WASD/Arrow.
- Prompt `E` muncul dekat sampah.
- Tekan `E` dekat sampah -> item hilang -> inventory bertambah.
- Tekan `E` dekat NPC -> dialog muncul.
- Tekan `E` dekat Eco Center/TPS -> recycle berjalan.
- World status naik setelah recycle.
- UI tidak overlap di desktop.
- Inventory modal muncul dengan `I`.
- Route pindah dashboard -> game -> dashboard tidak menambah canvas.

## Migration Plan

Prioritas 1:

- Ganti generated PNG dengan asset pack legal yang konsisten.
- Buka `eco_world.json` di Tiled dan rapikan layer secara visual.
- Tambahkan collision polygon/object untuk detail bangunan dan pohon.

Prioritas 2:

- Pecah `GameCanvas.jsx` menjadi `scenes`, `systems`, dan `ui`.
- Tambahkan BootScene dan PreloadScene.
- Tambahkan loading progress visual.
- Tambahkan audio manager.

Prioritas 3:

- Tambahkan quest accept/reject nyata.
- Tambahkan NPC schedule.
- Tambahkan day/night dan weather.
- Tambahkan minimap dari tilemap snapshot.

Prioritas 4:

- Tambahkan automated browser QA setelah Node runtime browser plugin diperbarui ke minimal `v22.22.0`.
- Tambahkan Playwright test untuk duplicate canvas, route cleanup, dan overlay text.
