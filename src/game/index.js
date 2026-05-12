/**
 * Game Initializer — Creates and manages the Phaser.Game instance
 *
 * Provides a clean API for React to create/destroy the game.
 * Handles Strict Mode double-mount safely.
 */

import { VIEW_WIDTH, VIEW_HEIGHT } from "./config/GameConfig";

let gameInstance = null;

/**
 * Create the Phaser game instance.
 * @param {HTMLElement} container — DOM element to attach the canvas to
 * @returns {Promise<Phaser.Game>}
 */
export async function createGame(container) {
  // Destroy any existing instance first
  destroyGame();

  // Clear container
  if (container) container.replaceChildren();

  // Dynamic import Phaser (Next.js SSR safety)
  const Phaser = (await import("phaser")).default;

  // Dynamic import scenes (code-splitting)
  const [{ default: BootScene }, { default: EcoWorldScene }] =
    await Promise.all([
      import("./scenes/BootScene"),
      import("./scenes/EcoWorldScene"),
    ]);

  const config = {
    type: Phaser.AUTO,
    parent: container,
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    backgroundColor: "#0a1a12",
    disableContextMenu: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, EcoWorldScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: container,
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      expandParent: false,
    },
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

/**
 * Destroy the Phaser game instance and clean up.
 */
export function destroyGame() {
  if (gameInstance) {
    try {
      // Shutdown active scenes first
      const scenes = gameInstance.scene.getScenes(true);
      scenes.forEach((scene) => {
        if (scene.shutdown) scene.shutdown();
      });
      gameInstance.destroy(true);
    } catch (err) {
      console.warn("[Game] Destroy error:", err);
    }
    gameInstance = null;
  }
}

/**
 * Get the current game instance.
 */
export function getGameInstance() {
  return gameInstance;
}
