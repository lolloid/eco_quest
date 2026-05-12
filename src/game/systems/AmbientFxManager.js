/**
 * AmbientFxManager - lightweight world ambience built from existing pixel sprites.
 *
 * Keeps the world alive without adding procedural debug shapes:
 * fireflies, falling leaves, glow plants, dust motes, and subtle floating props.
 */

import { ASSET_KEYS } from "../config/AssetManifest";
import { DEPTH } from "../config/GameConfig";

export default class AmbientFxManager {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.tweens = [];
    this.isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches;
  }

  init(mapWidth, mapHeight) {
    this.spawnFireflies(mapWidth, mapHeight);
    this.spawnFallingLeaves(mapWidth, mapHeight);
    this.spawnGlowPlants();
    this.spawnDustMotes(mapWidth, mapHeight);
  }

  spawnFireflies(mapWidth, mapHeight) {
    const count = this.isMobile ? 16 : 34;
    for (let i = 0; i < count; i += 1) {
      const x = 90 + ((i * 173) % Math.max(400, mapWidth - 180));
      const y = 130 + ((i * 97) % Math.max(360, mapHeight - 260));
      const fly = this.scene.add.sprite(x, y, ASSET_KEYS.TRASH, 6);
      fly.setScale(0.16 + (i % 3) * 0.03);
      fly.setTint(i % 2 ? 0xbef264 : 0x67e8f9);
      fly.setAlpha(0.35);
      fly.setDepth(DEPTH.PARTICLES + 8);
      fly.setBlendMode(Phaser.BlendModes.ADD);
      this.addGlow(fly, i % 2 ? 0xbef264 : 0x67e8f9, 1.2);

      this.objects.push(fly);
      this.tweens.push(
        this.scene.tweens.add({
          targets: fly,
          x: x + 18 - (i % 5) * 7,
          y: y - 14 + (i % 4) * 8,
          alpha: 0.82,
          duration: 1800 + (i % 7) * 260,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        })
      );
    }
  }

  spawnFallingLeaves(mapWidth, mapHeight) {
    const count = this.isMobile ? 12 : 28;
    for (let i = 0; i < count; i += 1) {
      const x = 60 + ((i * 211) % Math.max(360, mapWidth - 120));
      const y = 60 + ((i * 83) % Math.max(300, mapHeight - 200));
      const leaf = this.scene.add.sprite(x, y, ASSET_KEYS.TRASH, i % 2 ? 6 : 3);
      leaf.setScale(0.18);
      leaf.setTint(i % 3 === 0 ? 0xfacc15 : 0x86efac);
      leaf.setAlpha(0.45);
      leaf.setDepth(DEPTH.PARTICLES + 4);
      leaf.setAngle((i * 17) % 45);
      this.objects.push(leaf);

      this.tweens.push(
        this.scene.tweens.add({
          targets: leaf,
          x: x + 28 - (i % 4) * 17,
          y: y + 70 + (i % 5) * 9,
          angle: leaf.angle + 90,
          alpha: 0.05,
          duration: 4200 + (i % 6) * 420,
          delay: (i % 8) * 260,
          repeat: -1,
          ease: "Sine.easeInOut",
          onRepeat: () => {
            leaf.setPosition(60 + ((i * 211) % Math.max(360, mapWidth - 120)), 40);
            leaf.setAlpha(0.45);
          },
        })
      );
    }
  }

  spawnGlowPlants() {
    const positions = [
      [430, 900], [650, 1080], [1010, 980], [1230, 1060], [1680, 880],
      [1880, 1120], [2140, 760], [820, 420], [1450, 510], [2050, 430],
    ];

    positions.forEach(([x, y], index) => {
      const plant = this.scene.add.sprite(x, y, ASSET_KEYS.TRASH, 6);
      plant.setScale(0.42);
      plant.setTint(index % 2 ? 0x34d399 : 0xbef264);
      plant.setAlpha(0.62);
      plant.setDepth(Math.max(DEPTH.FLOOR_DECOR, Math.floor(y) - 6));
      plant.setBlendMode(Phaser.BlendModes.ADD);
      this.addGlow(plant, 0x34d399, 1.7);
      this.objects.push(plant);

      this.tweens.push(
        this.scene.tweens.add({
          targets: plant,
          alpha: 0.95,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 1300 + index * 60,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        })
      );
    });
  }

  spawnDustMotes(mapWidth, mapHeight) {
    const count = this.isMobile ? 10 : 22;
    for (let i = 0; i < count; i += 1) {
      const mote = this.scene.add.sprite(
        80 + ((i * 149) % Math.max(360, mapWidth - 160)),
        160 + ((i * 127) % Math.max(300, mapHeight - 320)),
        ASSET_KEYS.TRASH,
        8
      );
      mote.setScale(0.1);
      mote.setTint(0xd1fae5);
      mote.setAlpha(0.16);
      mote.setDepth(DEPTH.PARTICLES + 2);
      mote.setBlendMode(Phaser.BlendModes.ADD);
      this.objects.push(mote);

      this.tweens.push(
        this.scene.tweens.add({
          targets: mote,
          x: mote.x + 22,
          y: mote.y - 24,
          alpha: 0.36,
          duration: 2600 + i * 80,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        })
      );
    }
  }

  addGlow(target, color, intensity) {
    try {
      target.postFX?.addGlow(color, intensity, 0, false, 0.08, 8);
    } catch (_) {
      // Post FX is optional depending on renderer support.
    }
  }

  destroy() {
    this.tweens.forEach((tween) => tween.stop());
    this.objects.forEach((object) => object.destroy());
    this.tweens = [];
    this.objects = [];
  }
}
