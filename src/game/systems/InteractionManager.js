/**
 * InteractionManager — Handles proximity detection and E-key interaction
 *
 * Uses direct distance calculation for deterministic nearest-target finding.
 * Debounces EventBus emissions to avoid React re-render spam (60fps → only on change).
 */

import { INTERACTION_RADIUS } from "../config/GameConfig";
import EventBus, { EVENTS } from "../events/EventBus";

export default class InteractionManager {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.groups = { trash: null, npc: null, station: null };
    this.nearestTarget = null;
    this.highlightedTarget = null;
    this.pendingAction = false;

    // Debounce state — only emit when prompt actually changes
    this._lastPromptKey = null;
  }

  init(player, trashGroup, npcGroup, stationGroup) {
    this.player = player;
    this.groups.trash = trashGroup;
    this.groups.npc = npcGroup;
    this.groups.station = stationGroup;
  }

  /**
   * Find nearest interactive object using DIRECT distance calculation.
   */
  findNearest() {
    if (!this.player?.sprite) return null;

    const px = this.player.x;
    const py = this.player.y;
    let best = null;
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches;
    let bestDist = INTERACTION_RADIUS + (isMobile ? 32 : 0);

    const checkGroup = (group, kind) => {
      if (!group) return;
      const children = group.getChildren ? group.getChildren() : [];
      children.forEach((obj) => {
        if (!obj?.active || !obj.ecoData) return;
        const dist = Phaser.Math.Distance.Between(px, py, obj.x, obj.y);
        const priorityDist = kind === "trash" ? dist - 14 : kind === "station" ? dist - 6 : dist;
        if (priorityDist < bestDist) {
          bestDist = priorityDist;
          best = { target: obj, kind, dist };
        }
      });
    };

    checkGroup(this.groups.trash, "trash");
    checkGroup(this.groups.npc, "npc");
    checkGroup(this.groups.station, "station");

    return best;
  }

  findNearestKind(kind, radiusBoost = 0) {
    if (!this.player?.sprite || !this.groups[kind]) return null;

    const px = this.player.x;
    const py = this.player.y;
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches;
    let best = null;
    let bestDist = INTERACTION_RADIUS + radiusBoost + (isMobile ? 36 : 0);

    const children = this.groups[kind].getChildren ? this.groups[kind].getChildren() : [];
    children.forEach((obj) => {
      if (!obj?.active || !obj.ecoData) return;
      const dist = Phaser.Math.Distance.Between(px, py, obj.x, obj.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = { target: obj, kind, dist };
      }
    });

    return best;
  }

  update() {
    const found = this.findNearest();
    this.nearestTarget = found;

    const nextTarget = found?.target || null;
    if (this.highlightedTarget !== nextTarget) {
      this.highlightedTarget?.ecoSetHighlight?.(false);
      nextTarget?.ecoSetHighlight?.(true);
      this.highlightedTarget = nextTarget;
    }

    if (found) {
      const data = found.target.ecoData;
      let text = "";
      if (found.kind === "trash") text = `Ambil ${data.label}`;
      else if (found.kind === "npc") text = `Bicara ${data.name}`;
      else if (found.kind === "station") text = `Sorting di ${data.label}`;

      // Build a unique key for debouncing
      const promptKey = `${found.kind}_${found.target.x}_${found.target.y}`;

      // Only emit if prompt actually changed
      if (this._lastPromptKey !== promptKey) {
        this._lastPromptKey = promptKey;
        const key = found.kind === "station" ? "R" : "E";
        EventBus.emit(EVENTS.INTERACTION_PROMPT, { key, text, kind: found.kind });
      }
    } else {
      if (this._lastPromptKey !== null) {
        this._lastPromptKey = null;
        EventBus.emit(EVENTS.INTERACTION_CLEAR);
      }
    }
  }

  /**
   * Execute interaction with the nearest target.
   * Returns the target info or null if nothing nearby.
   */
  interact() {
    if (this.pendingAction || !this.nearestTarget) return null;
    return this.nearestTarget;
  }

  setPending(val) {
    this.pendingAction = val;
  }

  destroy() {
    this.highlightedTarget?.ecoSetHighlight?.(false);
    this.player = null;
    this.groups = { trash: null, npc: null, station: null };
    this.nearestTarget = null;
    this.highlightedTarget = null;
    this._lastPromptKey = null;
  }
}
