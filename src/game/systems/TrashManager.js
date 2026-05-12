/**
 * TrashManager — Spawns trash items, handles pickup logic
 */

import { ASSET_KEYS } from "../config/AssetManifest";
import { TRASH_VARIANTS } from "../config/TrashData";
import { DEPTH } from "../config/GameConfig";
import EventBus, { EVENTS } from "../events/EventBus";

export default class TrashManager {
  constructor(scene) {
    this.scene = scene;
    this.group = null;
    this.totalCount = 0;
  }

  init() {
    this.group = this.scene.physics.add.staticGroup();
    return this.group;
  }

  spawnFromMap(map) {
    const objects = map.getObjectLayer("trash")?.objects || [];

    objects.forEach((obj) => {
      const variantId = this.getProp(obj, "variant", obj.name) || "plastic_bottle";
      const variant = TRASH_VARIANTS[variantId] || TRASH_VARIANTS.plastic_bottle;

      const sprite = this.group.create(obj.x, obj.y, ASSET_KEYS.TRASH, variant.frame);
      sprite.setDepth(DEPTH.TRASH);
      sprite.setOrigin(0.5, 0.75);
      sprite.setScale(1.28);
      sprite.body.setSize(28, 26);
      sprite.body.setOffset(2, 4);
      sprite.refreshBody();

      const shadow = this.scene.add.sprite(obj.x, obj.y + 9, ASSET_KEYS.TRASH, variant.frame);
      shadow.setOrigin(0.5, 0.75);
      shadow.setScale(1.55, 0.36);
      shadow.setTint(0x020617);
      shadow.setAlpha(0.42);
      shadow.setDepth(DEPTH.TRASH - 2);

      const outline = this.scene.add.sprite(obj.x, obj.y + 1, ASSET_KEYS.TRASH, variant.frame);
      outline.setOrigin(0.5, 0.75);
      outline.setScale(1.48);
      outline.setTint(0x02131b);
      outline.setAlpha(0.75);
      outline.setDepth(DEPTH.TRASH - 1);

      try {
        sprite.postFX?.addGlow(0x67e8f9, 1.5, 0, false, 0.08, 10);
      } catch (_) {
        // Phaser falls back cleanly when post-processing is unavailable.
      }

      const floatTargets = [sprite, outline];
      const floatTween = this.scene.tweens.add({
        targets: floatTargets,
        y: "-=5",
        scaleX: "+=0.08",
        scaleY: "+=0.08",
        duration: 900 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      const shadowTween = this.scene.tweens.add({
        targets: shadow,
        scaleX: 1.72,
        alpha: 0.28,
        duration: 900 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      const indicator = this.scene.add.text(obj.x, obj.y - 31, "E", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#ecfeff",
        backgroundColor: "rgba(2, 6, 23, 0.86)",
        padding: { x: 5, y: 4 },
        stroke: "#020617",
        strokeThickness: 3,
      });
      indicator.setOrigin(0.5);
      indicator.setDepth(DEPTH.TRASH + 24);
      indicator.setAlpha(0);

      const indicatorTween = this.scene.tweens.add({
        targets: indicator,
        y: indicator.y - 5,
        duration: 720,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      const sparkles = [
        this.createSparkle(obj.x - 15, obj.y - 18, 0xbef264),
        this.createSparkle(obj.x + 15, obj.y - 13, 0x67e8f9),
        this.createSparkle(obj.x + 2, obj.y - 27, 0xecfeff),
      ];
      const sparkleTweens = sparkles.map((sparkle, index) =>
        this.scene.tweens.add({
          targets: sparkle,
          alpha: 0.92,
          scaleX: 0.34 + index * 0.04,
          scaleY: 0.34 + index * 0.04,
          duration: 420 + index * 90,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
          paused: true,
        })
      );

      sprite._readabilitySprites = [outline, shadow, indicator, ...sparkles];
      sprite._readabilityTweens = [floatTween, shadowTween, indicatorTween, ...sparkleTweens];
      sprite.ecoSetHighlight = (active) => {
        if (!sprite.active) return;
        indicator.setAlpha(active ? 1 : 0);
        outline.setAlpha(active ? 1 : 0.75);
        sprite.setTint(active ? 0xecfeff : 0xffffff);
        sprite.setScale(active ? 1.46 : 1.28);
        outline.setScale(active ? 1.66 : 1.48);
        sparkles.forEach((sparkle) => sparkle.setAlpha(active ? 0.55 : 0));
        sparkleTweens.forEach((tween) => (active ? tween.resume() : tween.pause()));
      };

      sprite.ecoData = {
        kind: "trash",
        variantId,
        label: variant.label,
        trashType: this.getProp(obj, "trashType", variant.trashType),
        areaId: this.getProp(obj, "areaId", "taman_kota"),
        rarity: this.getProp(obj, "rarity", variant.rarity),
        points: variant.points,
      };
    });

    this.totalCount = this.group.getChildren().length;
    this.emitCount();
  }

  /**
   * Collect a trash item — plays pickup animation then destroys.
   */
  collect(target) {
    if (!target?.active) return;

    target._readabilityTweens?.forEach((tween) => tween.stop());
    const readabilityTargets = [target, ...(target._readabilitySprites || [])].filter(Boolean);
    this.spawnCollectFeedback(target);

    // Pickup animation: scale up + fade
    this.scene.tweens.add({
      targets: readabilityTargets,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      y: "-=22",
      duration: 300,
      ease: "Back.easeIn",
      onComplete: () => {
        target._readabilitySprites?.forEach((sprite) => sprite.destroy());
        target.disableBody(true, true);
        this.emitCount();
      },
    });
  }

  getActiveCount() {
    return this.group ? this.group.getChildren().filter((c) => c.active).length : 0;
  }

  emitCount() {
    EventBus.emit(EVENTS.TRASH_COUNT, {
      total: this.totalCount,
      remaining: this.getActiveCount(),
      collected: this.totalCount - this.getActiveCount(),
    });
  }

  createSparkle(x, y, tint) {
    const sparkle = this.scene.add.sprite(x, y, ASSET_KEYS.TRASH, 3);
    sparkle.setScale(0.24);
    sparkle.setTint(tint);
    sparkle.setAlpha(0);
    sparkle.setDepth(DEPTH.TRASH + 18);
    sparkle.setBlendMode(Phaser.BlendModes.ADD);
    return sparkle;
  }

  spawnCollectFeedback(target) {
    const points = target.ecoData?.points || 10;
    const pickupText = this.scene.add.text(target.x, target.y - 51, "SAMPAH DIAMBIL!", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#ecfeff",
      stroke: "#020617",
      strokeThickness: 4,
    });
    pickupText.setOrigin(0.5);
    pickupText.setDepth(DEPTH.PARTICLES + 30);

    this.scene.tweens.add({
      targets: pickupText,
      y: pickupText.y - 25,
      alpha: 0,
      duration: 850,
      ease: "Cubic.easeOut",
      onComplete: () => pickupText.destroy(),
    });

    const xpText = this.scene.add.text(target.x, target.y - 35, `+${points} EP`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#bef264",
      stroke: "#020617",
      strokeThickness: 4,
    });
    xpText.setOrigin(0.5);
    xpText.setDepth(DEPTH.PARTICLES + 28);

    this.scene.tweens.add({
      targets: xpText,
      y: xpText.y - 34,
      alpha: 0,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 760,
      ease: "Cubic.easeOut",
      onComplete: () => xpText.destroy(),
    });

    for (let i = 0; i < 8; i += 1) {
      const chip = this.scene.add.sprite(target.x, target.y - 4, ASSET_KEYS.TRASH, target.frame?.name ?? 0);
      chip.setScale(0.18);
      chip.setTint([0x67e8f9, 0xbef264, 0xfacc15, 0x34d399][i % 4]);
      chip.setAlpha(0.9);
      chip.setDepth(DEPTH.PARTICLES + 24);
      chip.setBlendMode(Phaser.BlendModes.ADD);

      this.scene.tweens.add({
        targets: chip,
        x: target.x + Phaser.Math.Between(-30, 30),
        y: target.y + Phaser.Math.Between(-44, -12),
        alpha: 0,
        scaleX: 0.05,
        scaleY: 0.05,
        duration: 560 + i * 28,
        ease: "Cubic.easeOut",
        onComplete: () => chip.destroy(),
      });
    }
  }

  getProp(object, name, fallback = null) {
    const prop = object?.properties?.find((p) => p.name === name);
    return prop?.value ?? fallback;
  }

  destroy() {
    if (this.group) {
      this.group.getChildren().forEach((trash) => {
        trash._readabilityTweens?.forEach((tween) => tween.stop());
        trash._readabilitySprites?.forEach((sprite) => sprite.destroy());
      });
      this.group.destroy(true);
    }
    this.group = null;
  }
}
