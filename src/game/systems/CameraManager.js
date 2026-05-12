/**
 * CameraManager — Smooth camera follow with zoom and pixel perfect rendering
 */

import { CAMERA_LERP, CAMERA_ZOOM } from "../config/GameConfig";

export default class CameraManager {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  init(mapWidth, mapHeight) {
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches;
    const zoom = isMobile ? Math.max(0.95, CAMERA_ZOOM - 0.32) : CAMERA_ZOOM;

    this.camera.setBounds(0, 0, mapWidth, mapHeight);
    this.camera.setBackgroundColor("#0a1a12");
    this.camera.setZoom(zoom);
    this.camera.setRoundPixels(true);
  }

  follow(target) {
    if (target?.sprite) {
      this.camera.startFollow(target.sprite, true, CAMERA_LERP, CAMERA_LERP);
    }
  }

  /**
   * Smoothly pan camera to a position.
   */
  panTo(x, y, duration = 500) {
    this.camera.pan(x, y, duration, "Sine.easeInOut");
  }

  /**
   * Screen shake effect (for impact feedback).
   */
  shake(duration = 100, intensity = 0.005) {
    this.camera.shake(duration, intensity);
  }

  /**
   * Flash effect (for rewards).
   */
  flash(duration = 200, r = 52, g = 211, b = 153) {
    this.camera.flash(duration, r, g, b);
  }

  /**
   * Fade effect.
   */
  fadeIn(duration = 500) {
    this.camera.fadeIn(duration, 10, 26, 18);
  }

  fadeOut(duration = 500) {
    this.camera.fadeOut(duration, 10, 26, 18);
  }

  destroy() {
    this.camera = null;
  }
}
