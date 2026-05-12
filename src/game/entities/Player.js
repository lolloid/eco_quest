/**
 * Player — Player entity with animations, shadow, and movement
 */

import { ASSET_KEYS } from "../config/AssetManifest";
import { PLAYER_SPEED, DEPTH } from "../config/GameConfig";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // Readability layers use the same pixel sprite so the player stays sharp.
    this.shadow = scene.add.sprite(x, y + 12, ASSET_KEYS.HERO, 0);
    this.shadow.setOrigin(0.5, 0.88);
    this.shadow.setScale(1.22, 0.26);
    this.shadow.setTint(0x020617);
    this.shadow.setAlpha(0.38);
    this.shadow.setDepth(DEPTH.PLAYER - 3);

    this.outline = scene.add.sprite(x, y + 1, ASSET_KEYS.HERO, 0);
    this.outline.setOrigin(0.5, 0.88);
    this.outline.setScale(1.15);
    this.outline.setTint(0xd1fae5);
    this.outline.setAlpha(0.58);
    this.outline.setDepth(DEPTH.PLAYER - 2);

    // Sprite — professional 32×32 spritesheet
    this.sprite = scene.physics.add.sprite(x, y, ASSET_KEYS.HERO, 0);
    this.sprite.setDepth(DEPTH.PLAYER);
    this.sprite.setOrigin(0.5, 0.88);
    this.sprite.body.setSize(16, 20);
    this.sprite.body.setOffset(8, 11);
    this.sprite.setCollideWorldBounds(true);

    try {
      this.sprite.postFX?.addGlow(0x67e8f9, 1.15, 0, false, 0.08, 8);
    } catch (_) {
      // Renderer enhancement only.
    }

    this.facing = "down";
    this.isMoving = false;

    this.createAnimations();
  }

  createAnimations() {
    const scene = this.scene;
    const key = ASSET_KEYS.HERO;

    const anims = [
      { name: "hero-down", start: 0, end: 3 },
      { name: "hero-left", start: 4, end: 7 },
      { name: "hero-right", start: 8, end: 11 },
      { name: "hero-up", start: 12, end: 15 },
    ];

    anims.forEach(({ name, start, end }) => {
      if (!scene.anims.exists(name)) {
        scene.anims.create({
          key: name,
          frames: scene.anims.generateFrameNumbers(key, { start, end }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Idle frames (first frame of each direction)
    const idles = [
      { name: "hero-idle-down", frame: 0 },
      { name: "hero-idle-left", frame: 4 },
      { name: "hero-idle-right", frame: 8 },
      { name: "hero-idle-up", frame: 12 },
    ];

    idles.forEach(({ name, frame }) => {
      if (!scene.anims.exists(name)) {
        scene.anims.create({
          key: name,
          frames: [{ key, frame }],
          frameRate: 1,
        });
      }
    });
  }

  update(cursors, wasd, virtualMove = { x: 0, y: 0 }) {
    if (!this.sprite?.body) return;

    const speed = PLAYER_SPEED;
    this.sprite.body.setVelocity(0);

    const keyboardX =
      (cursors.left.isDown || wasd.left.isDown ? -1 : 0) +
      (cursors.right.isDown || wasd.right.isDown ? 1 : 0);
    const keyboardY =
      (cursors.up.isDown || wasd.up.isDown ? -1 : 0) +
      (cursors.down.isDown || wasd.down.isDown ? 1 : 0);
    const analogX = Phaser.Math.Clamp(Number(virtualMove.x) || 0, -1, 1);
    const analogY = Phaser.Math.Clamp(Number(virtualMove.y) || 0, -1, 1);
    const inputX = keyboardX !== 0 ? keyboardX : analogX;
    const inputY = keyboardY !== 0 ? keyboardY : analogY;

    this.sprite.body.setVelocity(inputX * speed, inputY * speed);

    if (inputX < -0.15) {
      this.facing = "left";
    }
    if (inputX > 0.15) {
      this.facing = "right";
    }
    if (inputY < -0.15 && Math.abs(inputY) >= Math.abs(inputX)) {
      this.facing = "up";
    }
    if (inputY > 0.15 && Math.abs(inputY) >= Math.abs(inputX)) {
      this.facing = "down";
    }

    const velocity = this.sprite.body.velocity;
    if (velocity.length() > speed) {
      velocity.normalize().scale(speed);
    }

    this.isMoving = this.sprite.body.velocity.lengthSq() > 0;

    if (this.isMoving) {
      this.sprite.anims.play(`hero-${this.facing}`, true);
    } else {
      this.sprite.anims.stop();
      // Set idle frame based on facing direction
      const idleFrames = { down: 0, left: 4, right: 8, up: 12 };
      this.sprite.setFrame(idleFrames[this.facing] || 0);
    }

    // Update readability layers and subtle idle breathing.
    const frame = this.sprite.frame?.name ?? 0;
    const pulse = this.isMoving ? 0 : Math.sin(this.scene.time.now / 260) * 0.8;
    this.shadow.setPosition(this.sprite.x, this.sprite.y + 12);
    this.shadow.setFrame(frame);

    this.outline.setPosition(this.sprite.x, this.sprite.y + 1 + pulse * 0.2);
    this.outline.setFrame(frame);
    this.outline.setAlpha(this.isMoving ? 0.5 : 0.66);

    // Y-sort depth
    const depth = Math.max(DEPTH.PLAYER, Math.floor(this.sprite.y));
    this.shadow.setDepth(depth - 3);
    this.outline.setDepth(depth - 2);
    this.sprite.setDepth(depth);
  }

  get x() {
    return this.sprite?.x || 0;
  }

  get y() {
    return this.sprite?.y || 0;
  }

  get body() {
    return this.sprite?.body;
  }

  destroy() {
    this.shadow?.destroy();
    this.outline?.destroy();
    this.sprite?.destroy();
  }
}
