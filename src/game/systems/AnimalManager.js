/**
 * AnimalManager — Ambient animals that wander near their home positions
 *
 * Uses NPC spritesheet rows 7+ as animal stand-ins until a dedicated
 * animal sheet is created. Each ambient object's "frame" property
 * selects which NPC row to display.
 */

import { ASSET_KEYS } from "../config/AssetManifest";
import { DEPTH } from "../config/GameConfig";

export default class AnimalManager {
  constructor(scene) {
    this.scene = scene;
    this.group = null;
  }

  init() {
    this.group = this.scene.physics.add.group({ allowGravity: false });
    return this.group;
  }

  spawnFromMap(map) {
    const objects = map.getObjectLayer("ambient")?.objects || [];

    objects.forEach((obj) => {
      const frame = Number(this.getProp(obj, "frame", 0));

      // Use NPC spritesheet — frame*4 gives the first frame of that NPC row
      const animal = this.scene.physics.add.sprite(
        obj.x,
        obj.y,
        ASSET_KEYS.NPCS,
        frame * 4
      );
      animal.setDepth(DEPTH.OBJECTS + 1);
      animal.setOrigin(0.5, 0.8);
      animal.setScale(0.7); // Slightly smaller than NPCs to look like animals
      animal.body.setSize(14, 12);
      animal.body.setOffset(9, 14);
      animal.setCollideWorldBounds(true);
      animal.setAlpha(0.85);

      // Shadow
      const shadow = this.scene.add.ellipse(obj.x, obj.y + 8, 12, 4, 0x000000, 0.15);
      shadow.setDepth(DEPTH.OBJECTS);
      animal._shadow = shadow;

      animal.ecoData = {
        homeX: obj.x,
        homeY: obj.y,
        frame,
      };

      this.group.add(animal);
    });
  }

  wander() {
    if (!this.group) return;
    this.group.getChildren().forEach((animal) => {
      if (!animal.body || !animal.active) return;

      const data = animal.ecoData;
      const dx = data.homeX - animal.x;
      const dy = data.homeY - animal.y;
      const distFromHome = Math.hypot(dx, dy);

      // Pull back if too far from home
      const pull = distFromHome > 50 ? 0.8 : 0.2;
      const speed = 20 + Math.random() * 15;

      animal.setVelocity(
        dx * pull + (Math.random() - 0.5) * speed,
        dy * pull + (Math.random() - 0.5) * speed
      );

      // Flip sprite based on horizontal direction
      if (animal.body.velocity.x < -2) animal.setFlipX(true);
      else if (animal.body.velocity.x > 2) animal.setFlipX(false);

      this.scene.time.delayedCall(900, () => {
        if (animal.active && animal.body) {
          animal.setVelocity(0, 0);
        }
      });
    });
  }

  update() {
    if (!this.group) return;
    this.group.getChildren().forEach((animal) => {
      if (!animal.active) return;
      animal.setDepth(Math.max(DEPTH.OBJECTS + 1, Math.floor(animal.y)));
      // Update shadow
      if (animal._shadow) {
        animal._shadow.setPosition(animal.x, animal.y + 8);
      }
    });
  }

  getProp(object, name, fallback = null) {
    const prop = object?.properties?.find((p) => p.name === name);
    return prop?.value ?? fallback;
  }

  destroy() {
    if (this.group) {
      this.group.getChildren().forEach((animal) => {
        animal._shadow?.destroy();
      });
      this.group.destroy(true);
    }
    this.group = null;
  }
}
