/**
 * EventBus — Phaser ↔ React Communication Bridge
 * 
 * Uses a simple pub/sub pattern that both Phaser scenes
 * and React components can subscribe to. This replaces
 * window.dispatchEvent/addEventListener for cleaner decoupling.
 */

class GameEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this.listeners.delete(event);
    }
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      });
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Event name constants
export const EVENTS = {
  // Game lifecycle
  GAME_READY: "game:ready",
  GAME_SYNC: "game:sync",

  // Player
  PLAYER_MOVE: "player:move",
  PLAYER_POSITION: "player:position",
  PLAYER_AREA_CHANGED: "player:area-changed",

  // Interaction
  INTERACTION_PROMPT: "interaction:prompt",
  INTERACTION_CLEAR: "interaction:clear",
  INTERACTION_REQUEST: "interaction:request",
  RECYCLE_REQUEST: "interaction:recycle-request",

  // Dialog
  DIALOG_OPEN: "dialog:open",
  DIALOG_CLOSE: "dialog:close",
  DIALOG_ACCEPT: "dialog:accept",

  // Inventory
  INVENTORY_OPEN: "inventory:open",
  INVENTORY_CLOSE: "inventory:close",
  INVENTORY_UPDATED: "inventory:updated",

  // Trash
  TRASH_COLLECTED: "trash:collected",
  TRASH_COUNT: "trash:count",

  // Recycle
  RECYCLE_START: "recycle:start",
  RECYCLE_RESULT: "recycle:result",

  // Score
  SCORE_UPDATED: "score:updated",
  REWARD_POPUP: "reward:popup",

  // World
  WORLD_STATUS: "world:status",
  WORLD_CLEANLINESS: "world:cleanliness",
  WORLD_MOOD: "world:mood",

  // Quest
  QUEST_UPDATED: "quest:updated",
  QUEST_COMPLETED: "quest:completed",

  // Error
  GAME_ERROR: "game:error",
};

const EventBus = new GameEventBus();
export default EventBus;
