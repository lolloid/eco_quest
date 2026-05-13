# PixelTerra Professional Game Assets

Place licensed professional pixel-art assets in this directory.

Required files:

- maps/eco_world.json
- tilesets/ecoquest_tiles.png
- characters/hero.png
- characters/npcs.png
- objects/trash_items.png
- objects/stations.png
- ui/pixel_ui_tiles.png
- ui/panel_dark.png
- ui/button_dark.png
- audio/ambient_forest.mp3
- audio/collect.ogg
- audio/ui_click.ogg
- audio/recycle.ogg
- audio/error.ogg
- audio/footstep.ogg
- audio/dialog_blip.ogg
- audio/ui_hover.ogg
- audio/level_up.ogg

Map contract:

- Tile size: 32 x 32
- First tileset name: ecoquest_tiles
- First tileset image: ../tilesets/ecoquest_tiles.png
- Required layers:
  - ground
  - grass_detail
  - paths
  - shadows
  - water
  - buildings
  - decorations
  - top_objects
  - lighting
  - collision
  - areas
  - trash
  - npcs
  - stations
  - ambient
  - player_spawn

Sprite contracts:

- characters/hero.png: 32x32 frames, at least 4 columns x 6 rows
- characters/npcs.png: 32x32 frames, at least 4 columns x 9 rows
- objects/trash_items.png: 32x32 frames, at least 16 columns x 1 row
- objects/stations.png: 64x64 frames, at least 2 columns x 1 row
- ui/pixel_ui_tiles.png: pixel UI tilesheet
- ui/panel_dark.png and ui/button_dark.png: 32x32 pixel UI tiles

Audio contracts:

- audio/ambient_forest.mp3: looping world ambience
- audio/collect.ogg: pickup reward SFX
- audio/ui_click.ogg: dialog/UI interaction SFX
- audio/recycle.ogg: recycle station SFX
- audio/error.ogg: rejected action SFX
- audio/footstep.ogg: lightweight movement SFX
- audio/dialog_blip.ogg: dialog/typewriter blip
- audio/ui_hover.ogg: UI hover/select SFX
- audio/level_up.ogg: level up or major reward SFX

Recommended source pack:

- Ninja Adventure Asset Pack, CC0: https://pixel-boy.itch.io/ninja-adventure-asset-pack

Installed CC0 source packs:

- Kenney RPG Urban Pack: world tiles, characters, trash, stations
- Kenney UI Pack - Pixel Adventure: pixel panel/button UI
- Kenney Interface Sounds: pickup, dialog, recycle, error SFX
- OpenGameArt Forest Ambience by TinyWorlds: background ambience

After placing assets:

1. Run npm run validate:game-assets
2. Add NEXT_PUBLIC_USE_PROFESSIONAL_GAME_ASSETS=true to .env.local
3. Restart the Next.js dev server

## Import workflow

Preferred workflow:

1. Download and extract a licensed pixel-art pack outside this repo.
2. Create `public/assets/pixel/professional/import-manifest.json`.
3. Run:

```bash
npm run import:professional-assets -- --source "C:/path/to/extracted/asset-pack"
```

Use `--force` only when you intentionally want to overwrite files already imported.

Example manifest:

```json
{
  "files": {
    "map": "maps/eco_world.json",
    "tiles": "tilesets/ecoquest_tiles.png",
    "hero": "characters/hero.png",
    "npcs": "characters/npcs.png",
    "trash": "objects/trash_items.png",
    "stations": "objects/stations.png"
  }
}
```

The importer copies those files into the required PixelTerra professional asset slots and normalizes the Tiled map tileset reference to `../tilesets/ecoquest_tiles.png`.
