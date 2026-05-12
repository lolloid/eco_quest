/**
 * WorldStatusManager — Tracks area cleanliness and applies visual mood
 */

import { AREA_DEFINITIONS } from "../config/WorldData";
import { COLORS } from "../config/GameConfig";
import EventBus, { EVENTS } from "../events/EventBus";

export default class WorldStatusManager {
  constructor(scene) {
    this.scene = scene;
    this.layers = [];
    this.waterLayer = null;
    this.areaObjects = [];
    this.currentCleanliness = 50;
    this.currentAreaId = "taman_kota";
  }

  init(layers, waterLayer, areaObjects) {
    this.layers = layers || [];
    this.waterLayer = waterLayer;
    this.areaObjects = areaObjects || [];
  }

  /**
   * Find which area the player is currently in.
   */
  findCurrentArea(x, y) {
    const found = this.areaObjects.find((area) => {
      return (
        x >= area.x &&
        y >= area.y &&
        x <= area.x + area.width &&
        y <= area.y + area.height
      );
    });

    if (!found) {
      return { areaId: "taman_kota", name: "Taman Kota" };
    }

    const areaId = this.getProp(found, "areaId", "taman_kota");
    const def = AREA_DEFINITIONS[areaId];

    return {
      areaId,
      name: def?.name || found.name || "Unknown",
    };
  }

  /**
   * Update the current area based on player position.
   */
  updatePlayerArea(x, y) {
    const area = this.findCurrentArea(x, y);
    if (area.areaId !== this.currentAreaId) {
      this.currentAreaId = area.areaId;
      EventBus.emit(EVENTS.PLAYER_AREA_CHANGED, area);
    }
    return area;
  }

  /**
   * Apply visual mood (tint) based on cleanliness level.
   */
  applyWorldMood(cleanliness) {
    this.currentCleanliness = cleanliness;
    const isClean = cleanliness >= 55;

    this.layers.forEach((layer) => {
      if (layer && layer.setTint) {
        layer.setTint(isClean ? COLORS.CLEAN_TINT : COLORS.DIRTY_TINT);
      }
    });

    if (this.waterLayer && this.waterLayer.setTint) {
      this.waterLayer.setTint(
        cleanliness >= 65 ? COLORS.CLEAN_WATER : COLORS.DIRTY_WATER
      );
    }

    EventBus.emit(EVENTS.WORLD_MOOD, { cleanliness, isClean });
  }

  /**
   * Animate water tiles by swapping tile indices.
   */
  animateWater(waterFrame) {
    if (!this.waterLayer) return;
    const newFrame = waterFrame === 7 ? 8 : 7;
    this.waterLayer.forEachTile((tile) => {
      if (tile.index === 7 || tile.index === 8) {
        tile.index = newFrame;
      }
    });
    return newFrame;
  }

  getProp(object, name, fallback = null) {
    const prop = object?.properties?.find((p) => p.name === name);
    return prop?.value ?? fallback;
  }

  destroy() {
    this.layers = [];
    this.waterLayer = null;
    this.areaObjects = [];
  }
}
