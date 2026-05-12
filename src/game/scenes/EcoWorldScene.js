/**
 * EcoWorldScene — Main game world scene (refactored from monolithic GameCanvas)
 *
 * Delegates to specialized managers instead of handling everything inline.
 * All React communication goes through EventBus.
 */

import { ASSET_KEYS, TILESET_CONFIG } from "../config/AssetManifest";
import {
  DEPTH,
  MAP_WIDTH,
  MAP_HEIGHT,
  NPC_WANDER_INTERVAL,
  ANIMAL_WANDER_INTERVAL,
} from "../config/GameConfig";
import { STATION_DEFINITIONS } from "../config/TrashData";
import EventBus, { EVENTS } from "../events/EventBus";
import Player from "../entities/Player";
import InteractionManager from "../systems/InteractionManager";
import NPCManager from "../systems/NPCManager";
import TrashManager from "../systems/TrashManager";
import AnimalManager from "../systems/AnimalManager";
import AmbientFxManager from "../systems/AmbientFxManager";
import WorldStatusManager from "../systems/WorldStatusManager";
import CameraManager from "../systems/CameraManager";
import AudioManager from "../systems/AudioManager";

const CATEGORY_FRAMES = {
  plastic: 0,
  paper: 5,
  metal: 6,
  glass: 11,
  organic: 9,
  electronic: 14,
};

const CATEGORY_SHORT_LABELS = {
  plastic: "PLS",
  paper: "KRT",
  metal: "KLG",
  glass: "KCA",
  organic: "ORG",
  electronic: "ELC",
};

export default class EcoWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: "EcoWorldScene" });

    this.map = null;
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.interactKey = null;
    this.recycleKey = null;
    this.inventoryKey = null;

    // Managers
    this.interactionMgr = null;
    this.npcMgr = null;
    this.trashMgr = null;
    this.animalMgr = null;
    this.ambientFxMgr = null;
    this.worldMgr = null;
    this.cameraMgr = null;
    this.audioMgr = null;

    // Tilemap layers
    this.layers = [];
    this.collisionLayer = null;
    this.waterLayer = null;
    this.moodLayers = [];
    this.lightingLayer = null;

    // Stations
    this.stationGroup = null;

    // State
    this.waterFrame = 7;
    this.cleanlinessValue = 50;
    this.lastInteractionAt = 0;
    this.virtualMove = { x: 0, y: 0 };

    // Callbacks bound for cleanup
    this._onWorldCleanliness = null;
    this._onInteractionRequest = null;
    this._onDialogClose = null;
    this._onPlayerMove = null;
  }

  create() {
    // === 1. TILEMAP ===
    this.map = this.make.tilemap({ key: ASSET_KEYS.MAP });
    const tileset = this.map.addTilesetImage(
      TILESET_CONFIG.name,
      ASSET_KEYS.TILES,
      TILESET_CONFIG.tileWidth,
      TILESET_CONFIG.tileHeight
    );

    // Create layers in order — must match professional tilemap layer names
    const layerConfigs = [
      ["ground",       DEPTH.GROUND],
      ["grass_detail", DEPTH.PATHS - 0.5],
      ["paths",        DEPTH.PATHS],
      ["shadows",      DEPTH.SHADOWS],
      ["water",        DEPTH.WATER],
      ["buildings",    DEPTH.BUILDINGS],
      ["decorations",  DEPTH.WALL_DECOR],
      ["top_objects",  DEPTH.ABOVE_PLAYER + 40],
      ["lighting",     95],
    ];

    this.layers = layerConfigs
      .map(([name, depth]) => {
        const layer = this.map.createLayer(name, tileset, 0, 0);
        if (layer) layer.setDepth(depth);
        return layer;
      })
      .filter(Boolean);

    // Identify special layers
    this.waterLayer = this.layers.find(
      (l) => l.layer?.name === "water"
    ) || null;
    this.lightingLayer = this.layers.find(
      (l) => l.layer?.name === "lighting"
    ) || null;
    this.moodLayers = this.layers.filter(
      (l) => l.layer?.name !== "lighting" && l.layer?.name !== "shadows"
    );

    // Lighting layer — additive blend for glow effect
    if (this.lightingLayer) {
      this.lightingLayer.setAlpha(0.8);
      this.lightingLayer.setBlendMode(Phaser.BlendModes.ADD);
    }

    // Collision layer
    this.collisionLayer = this.map.createLayer("collision", tileset, 0, 0);
    if (this.collisionLayer) {
      this.collisionLayer.setVisible(false);
      this.collisionLayer.setCollisionByExclusion([-1, 0]);
    }

    // Set world bounds from actual map
    const mapW = this.map.widthInPixels || MAP_WIDTH;
    const mapH = this.map.heightInPixels || MAP_HEIGHT;
    this.physics.world.setBounds(0, 0, mapW, mapH);

    // === 2. INITIALIZE MANAGERS ===
    this.npcMgr = new NPCManager(this);
    const npcGroup = this.npcMgr.init();
    this.npcMgr.spawnFromMap(this.map);

    this.trashMgr = new TrashManager(this);
    const trashGroup = this.trashMgr.init();
    this.trashMgr.spawnFromMap(this.map);

    this.animalMgr = new AnimalManager(this);
    this.animalMgr.init();
    this.animalMgr.spawnFromMap(this.map);

    this.ambientFxMgr = new AmbientFxManager(this);
    this.ambientFxMgr.init(mapW, mapH);

    this.stationGroup = this.physics.add.staticGroup();
    this.spawnStations();

    // === 3. PLAYER ===
    const spawn = this.map.getObjectLayer("player_spawn")?.objects?.[0] || {
      x: 400,
      y: 320,
    };
    this.player = new Player(this, spawn.x, spawn.y);

    // === 4. INTERACTION MANAGER ===
    this.interactionMgr = new InteractionManager(this);
    this.interactionMgr.init(
      this.player,
      trashGroup,
      npcGroup,
      this.stationGroup
    );

    // === 5. WORLD STATUS ===
    const areaObjects = this.map.getObjectLayer("areas")?.objects || [];
    this.worldMgr = new WorldStatusManager(this);
    this.worldMgr.init(this.moodLayers, this.waterLayer, areaObjects);
    this.worldMgr.applyWorldMood(this.cleanlinessValue);

    // === 6. AUDIO ===
    this.audioMgr = new AudioManager(this);
    this.audioMgr.init();

    // === 7. CAMERA ===
    this.cameraMgr = new CameraManager(this);
    this.cameraMgr.init(mapW, mapH);
    this.cameraMgr.follow(this.player);
    this.cameraMgr.fadeIn(600);

    // === 8. COLLISIONS ===
    if (this.collisionLayer) {
      this.physics.add.collider(this.player.sprite, this.collisionLayer);
    }
    this.physics.add.collider(this.player.sprite, npcGroup);
    this.physics.add.collider(this.player.sprite, this.stationGroup);
    this.physics.add.collider(npcGroup, this.collisionLayer);

    // === 9. INPUT ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: "W",
      left: "A",
      down: "S",
      right: "D",
    });
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.recycleKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );
    this.inventoryKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.I
    );

    // === 10. TIMED EVENTS ===
    this.time.addEvent({
      delay: 150,
      loop: true,
      callback: this.syncAreaState,
      callbackScope: this,
    });

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.waterFrame = this.worldMgr.animateWater(this.waterFrame);
      },
      callbackScope: this,
    });

    this.time.addEvent({
      delay: NPC_WANDER_INTERVAL,
      loop: true,
      callback: () => this.npcMgr.wander(),
      callbackScope: this,
    });

    this.time.addEvent({
      delay: ANIMAL_WANDER_INTERVAL,
      loop: true,
      callback: () => this.animalMgr.wander(),
      callbackScope: this,
    });

    // === 11. EVENT BUS LISTENERS ===
    this._onWorldCleanliness = (data) => {
      this.cleanlinessValue = data?.cleanliness ?? 50;
      this.worldMgr.applyWorldMood(this.cleanlinessValue);
    };
    EventBus.on(EVENTS.WORLD_CLEANLINESS, this._onWorldCleanliness);

    this._onInteractionRequest = () => {
      this.tryInteract();
    };
    EventBus.on(EVENTS.INTERACTION_REQUEST, this._onInteractionRequest);

    this._onRecycleRequest = () => {
      this.tryRecycle();
    };
    EventBus.on(EVENTS.RECYCLE_REQUEST, this._onRecycleRequest);

    this._onPlayerMove = (data = {}) => {
      this.virtualMove = {
        x: Phaser.Math.Clamp(Number(data.x) || 0, -1, 1),
        y: Phaser.Math.Clamp(Number(data.y) || 0, -1, 1),
      };
    };
    EventBus.on(EVENTS.PLAYER_MOVE, this._onPlayerMove);

    // === 12. EMIT READY ===
    EventBus.emit(EVENTS.GAME_READY, {
      trashTotal: this.trashMgr.totalCount,
      trashRemaining: this.trashMgr.getActiveCount(),
    });
  }

  spawnStations() {
    const objects = this.map.getObjectLayer("stations")?.objects || [];

    objects.forEach((obj) => {
      const stationId =
        this.getProp(obj, "stationId", obj.name) || "eco_center";
      const def = STATION_DEFINITIONS[stationId] || STATION_DEFINITIONS.eco_center;
      const stationFrame = Number(this.getProp(obj, "frame", def.frame)) || def.frame;
      const mapAccepts = this.getProp(obj, "accepts", null);
      const accepts = typeof mapAccepts === "string"
        ? mapAccepts.split(",").map((item) => item.trim()).filter(Boolean)
        : def.accepts;

      const station = this.stationGroup.create(
        obj.x,
        obj.y,
        ASSET_KEYS.STATIONS,
        stationFrame
      );
      station.setDepth(DEPTH.STATIONS);
      station.setOrigin(0.5, 0.8);
      station.setScale(1.08);
      station.body.setSize(46, 38);
      station.body.setOffset(9, 18);
      station.refreshBody();

      const shadow = this.add.sprite(obj.x, obj.y + 15, ASSET_KEYS.STATIONS, stationFrame);
      shadow.setOrigin(0.5, 0.8);
      shadow.setScale(1.28, 0.42);
      shadow.setTint(0x020617);
      shadow.setAlpha(0.38);
      shadow.setDepth(DEPTH.STATIONS - 2);

      const outline = this.add.sprite(obj.x, obj.y + 1, ASSET_KEYS.STATIONS, stationFrame);
      outline.setOrigin(0.5, 0.8);
      outline.setScale(1.2);
      outline.setTint(0x02131b);
      outline.setAlpha(0.7);
      outline.setDepth(DEPTH.STATIONS - 1);

      try {
        station.postFX?.addGlow(0x34d399, 1.25, 0, false, 0.08, 10);
      } catch (_) {
        // Glow is an enhancement only; gameplay stays stable without it.
      }

      const indicator = this.add.text(obj.x, obj.y - 44, "RECYCLE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#bef264",
        backgroundColor: "rgba(2, 6, 23, 0.84)",
        padding: { x: 5, y: 4 },
        stroke: "#020617",
        strokeThickness: 3,
      });
      indicator.setOrigin(0.5);
      indicator.setDepth(DEPTH.STATIONS + 26);
      indicator.setAlpha(0);

      const categoryLabel = this.add.text(
        obj.x,
        obj.y - 28,
        accepts.map((item) => CATEGORY_SHORT_LABELS[item] || item.slice(0, 3).toUpperCase()).join(" "),
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#e0f2fe",
          backgroundColor: "rgba(2, 6, 23, 0.78)",
          padding: { x: 4, y: 3 },
          stroke: "#020617",
          strokeThickness: 2,
        }
      );
      categoryLabel.setOrigin(0.5);
      categoryLabel.setDepth(DEPTH.STATIONS + 25);
      categoryLabel.setAlpha(0.72);

      const categorySprites = accepts.slice(0, 5).map((category, index, list) => {
        const offset = (index - (list.length - 1) / 2) * 12;
        const frame = CATEGORY_FRAMES[category] ?? 0;
        const icon = this.add.sprite(obj.x + offset, obj.y + 23, ASSET_KEYS.TRASH, frame);
        icon.setOrigin(0.5);
        icon.setScale(0.48);
        icon.setDepth(DEPTH.STATIONS + 4);
        icon.setAlpha(0.88);
        icon.setTint(0xecfeff);
        return icon;
      });

      const indicatorTween = this.tweens.add({
        targets: indicator,
        y: indicator.y - 4,
        duration: 760,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      station._readabilitySprites = [outline, shadow, indicator, categoryLabel, ...categorySprites];
      station._readabilityTweens = [indicatorTween];
      station.ecoSetHighlight = (active) => {
        indicator.setAlpha(active ? 1 : 0);
        categoryLabel.setAlpha(active ? 1 : 0.72);
        categorySprites.forEach((icon) => {
          icon.setScale(active ? 0.62 : 0.48);
          icon.setAlpha(active ? 1 : 0.88);
        });
        outline.setAlpha(active ? 1 : 0.7);
        station.setTint(active ? 0xecfeff : 0xffffff);
        station.setScale(active ? 1.18 : 1.08);
      };

      station.ecoData = {
        kind: "station",
        stationId,
        label: def.label,
        areaId: this.getProp(obj, "areaId", def.areaId),
        accepts,
      };
    });
  }

  syncAreaState() {
    if (!this.player) return;
    const area = this.worldMgr.updatePlayerArea(
      this.player.x,
      this.player.y
    );

    // Update audio soundscape for the current area
    this.audioMgr?.updateAreaSoundscape(area.areaId);

    EventBus.emit(EVENTS.PLAYER_POSITION, {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      areaId: area.areaId,
      areaName: area.name,
    });
  }

  update(_time, _delta) {
    if (!this.player || !this.cursors || !this.wasd) return;

    const now = this.time.now;

    // Player movement
    this.player.update(this.cursors, this.wasd, this.virtualMove);

    // Footstep audio
    if (this.player.isMoving) {
      this.audioMgr?.playFootstep(now);
    }

    // Manager updates
    this.npcMgr.update();
    this.animalMgr.update();
    this.interactionMgr.update();

    // E key — interact
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }

    // I key — inventory
    if (Phaser.Input.Keyboard.JustDown(this.recycleKey)) {
      this.tryRecycle();
    }

    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      EventBus.emit(EVENTS.INVENTORY_OPEN);
    }
  }

  handleInteraction(found) {
    const { target, kind } = found;
    const data = target.ecoData;

    if (kind === "trash") {
      this.interactionMgr.setPending(true);
      this.audioMgr?.play("collect");
      EventBus.emit(EVENTS.TRASH_COLLECTED, {
        variantId: data.variantId,
        trashType: data.trashType,
        areaId: data.areaId,
        rarity: data.rarity,
        points: data.points,
        label: data.label,
      });
      this.trashMgr.collect(target);
      this.cameraMgr.shake(80, 0.004);

      // Release pending after animation
      this.time.delayedCall(400, () => {
        this.interactionMgr.setPending(false);
      });
    }

    if (kind === "npc") {
      this.audioMgr?.play("interact");
      const dialogEntry = this.npcMgr.getDialogForNPC(data.npcId);
      EventBus.emit(EVENTS.DIALOG_OPEN, {
        name: data.name,
        role: data.role,
        portrait: data.portrait,
        message: dialogEntry.message,
        quest: dialogEntry.quest,
        npcId: data.npcId,
      });
    }

    if (kind === "station") {
      this.audioMgr?.play("recycle");
      EventBus.emit(EVENTS.RECYCLE_START, {
        stationId: data.stationId,
        label: data.label,
        areaId: data.areaId,
        accepts: data.accepts,
      });
    }
  }

  tryInteract() {
    const now = this.time.now;
    if (now - this.lastInteractionAt < 180) return;
    this.lastInteractionAt = now;

    const target = this.interactionMgr?.interact();
    if (target) this.handleInteraction(target);
  }

  tryRecycle() {
    const now = this.time.now;
    if (now - this.lastInteractionAt < 180) return;
    this.lastInteractionAt = now;

    const target = this.interactionMgr?.findNearestKind("station", 18);
    if (target) {
      this.handleInteraction(target);
      return;
    }

    EventBus.emit(EVENTS.REWARD_POPUP, {
      type: "info",
      text: "Cari recycle station dulu",
    });
  }

  getProp(object, name, fallback = null) {
    const prop = object?.properties?.find((p) => p.name === name);
    return prop?.value ?? fallback;
  }

  shutdown() {
    // Clean up EventBus listeners
    if (this._onWorldCleanliness) {
      EventBus.off(EVENTS.WORLD_CLEANLINESS, this._onWorldCleanliness);
    }
    if (this._onInteractionRequest) {
      EventBus.off(EVENTS.INTERACTION_REQUEST, this._onInteractionRequest);
    }
    if (this._onRecycleRequest) {
      EventBus.off(EVENTS.RECYCLE_REQUEST, this._onRecycleRequest);
    }
    if (this._onPlayerMove) {
      EventBus.off(EVENTS.PLAYER_MOVE, this._onPlayerMove);
    }
    this.virtualMove = { x: 0, y: 0 };

    // Destroy managers
    this.interactionMgr?.destroy();
    this.npcMgr?.destroy();
    this.trashMgr?.destroy();
    this.animalMgr?.destroy();
    this.ambientFxMgr?.destroy();
    this.worldMgr?.destroy();
    this.cameraMgr?.destroy();
    this.audioMgr?.destroy();
    this.player?.destroy();

    if (this.stationGroup) {
      this.stationGroup.getChildren().forEach((station) => {
        station._readabilityTweens?.forEach((tween) => tween.stop());
        station._readabilitySprites?.forEach((sprite) => sprite.destroy());
      });
      this.stationGroup.destroy(true);
    }
  }
}
