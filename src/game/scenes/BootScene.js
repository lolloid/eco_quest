/**
 * BootScene — Handles asset loading with a professional loading bar
 *
 * Loads ALL game assets: tilemap, tilesets, spritesheets, and audio.
 */

import { ASSET_KEYS, ASSET_PATHS, SPRITESHEET_CONFIG, TILESET_CONFIG } from "../config/AssetManifest";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingUI();

    // Tilemap
    this.load.tilemapTiledJSON(ASSET_KEYS.MAP, ASSET_PATHS.map);

    // Tileset image
    this.load.image(ASSET_KEYS.TILES, ASSET_PATHS.tiles);

    // Spritesheets
    this.load.spritesheet(ASSET_KEYS.HERO, ASSET_PATHS.hero, SPRITESHEET_CONFIG.hero);
    this.load.spritesheet(ASSET_KEYS.NPCS, ASSET_PATHS.npcs, SPRITESHEET_CONFIG.npcs);
    this.load.spritesheet(ASSET_KEYS.TRASH, ASSET_PATHS.trash, SPRITESHEET_CONFIG.trash);
    this.load.spritesheet(ASSET_KEYS.STATIONS, ASSET_PATHS.stations, SPRITESHEET_CONFIG.stations);

    // Audio
    this.load.audio(ASSET_KEYS.AMBIENT, [ASSET_PATHS.audio.ambient]);
    this.load.audio(ASSET_KEYS.SFX_COLLECT, [ASSET_PATHS.audio.collect]);
    this.load.audio(ASSET_KEYS.SFX_INTERACT, [ASSET_PATHS.audio.interact]);
    this.load.audio(ASSET_KEYS.SFX_RECYCLE, [ASSET_PATHS.audio.recycle]);
    this.load.audio(ASSET_KEYS.SFX_ERROR, [ASSET_PATHS.audio.error]);
    this.load.audio(ASSET_KEYS.SFX_FOOTSTEP, [ASSET_PATHS.audio.footstep]);
    this.load.audio(ASSET_KEYS.SFX_DIALOG, [ASSET_PATHS.audio.dialogBlip]);
    this.load.audio(ASSET_KEYS.SFX_LEVEL_UP, [ASSET_PATHS.audio.levelUp]);

    // Don't crash on missing optional assets
    this.load.on("loaderror", (fileObj) => {
      console.warn(`[BootScene] Failed to load: ${fileObj.key} — using fallback`);
    });
  }

  createLoadingUI() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.cameras.main.setBackgroundColor("#0a1a12");

    // Title text
    this.add
      .text(cx, cy - 40, "ECOQUEST", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#34d399",
      })
      .setOrigin(0.5);

    // Loading bar background
    const barBg = this.add.rectangle(cx, cy + 10, 200, 12, 0x1e293b).setOrigin(0.5);
    barBg.setStrokeStyle(1, 0x334155);

    // Loading bar fill
    const barFill = this.add.rectangle(cx - 99, cy + 10, 0, 10, 0x10b981).setOrigin(0, 0.5);

    // Loading text
    const loadText = this.add
      .text(cx, cy + 35, "Memuat...", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    // Update loading bar on progress
    this.load.on("progress", (value) => {
      barFill.width = 198 * value;
      loadText.setText(`Memuat... ${Math.round(value * 100)}%`);
    });

    this.load.on("complete", () => {
      loadText.setText("Siap!");
    });
  }

  create() {
    // Small delay for polish, then start the main scene
    this.time.delayedCall(400, () => {
      this.scene.start("EcoWorldScene");
    });
  }
}
