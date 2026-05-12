# EcoQuest Handcrafted Map Guide

Open `ecoquest.tiled-project` in Tiled Map Editor, then open `ecoquest.world` or `../maps/eco_world.json`.

Layer contract used by Phaser:

1. `ground` - base terrain only.
2. `grass_detail` - non-blocking grass, flowers, small ground detail.
3. `paths` - dirt, bridge, and walkable route tiles.
4. `shadows` - soft environmental depth below buildings/trees.
5. `water` - animated water tiles only.
6. `buildings` - static landmark/building body tiles.
7. `decorations` - mid-layer props such as rocks, bushes, benches, lamps, signs.
8. `top_objects` - foreground and overlap detail such as river banks/fences.
9. `lighting` - glow and additive lighting accents.
10. `collision` - invisible blocking layer, use any non-zero tile.

Object layers:

- `areas`: rectangles with `areaId`.
- `trash`: point objects with `variant`, `trashType`, `areaId`, `rarity`.
- `npcs`: point objects with `npcId`, `areaId`, `frame`.
- `stations`: point objects with `stationId`, `areaId`, `frame`, `accepts`.
- `ambient`: point objects with `frame` for ambient life.
- `player_spawn`: one point object.

Composition rules:

- Keep paths readable from spawn to Eco Center, school, beach, river, lake, and TPS.
- Use `top_objects` for overlap/foreground, not `collision`.
- Add collision only to water, building bodies, dense trees, fences, cliffs, and large props.
- Add trash manually near story beats, not randomly across empty fields.
- Keep NPCs near landmarks and leave at least one tile of walkable space around them.
