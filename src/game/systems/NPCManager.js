/**
 * NPCManager — Spawns NPCs from tilemap objects, handles wandering AI
 */

import { ASSET_KEYS } from "../config/AssetManifest";
import { NPC_DEFINITIONS, DEFAULT_DIALOG } from "../config/NPCData";
import { NPC_WANDER_SPEED, NPC_WANDER_INTERVAL, DEPTH } from "../config/GameConfig";

export default class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.group = null;
  }

  init() {
    this.group = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.createAnimations();
    return this.group;
  }

  createAnimations() {
    for (let row = 0; row < 9; row++) {
      const key = `npc-${row}-idle`;
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key,
          frames: this.scene.anims.generateFrameNumbers(ASSET_KEYS.NPCS, {
            start: row * 4,
            end: row * 4 + 3,
          }),
          frameRate: 4,
          repeat: -1,
        });
      }
    }
  }

  spawnFromMap(map) {
    const objects = map.getObjectLayer("npcs")?.objects || [];

    objects.forEach((obj) => {
      const npcId = this.getProp(obj, "npcId", obj.name);
      const def = NPC_DEFINITIONS[npcId] || null;
      const frame = def ? def.frame : Number(this.getProp(obj, "frame", 0));

      const npc = this.scene.physics.add.sprite(obj.x, obj.y, ASSET_KEYS.NPCS, frame * 4);
      npc.setDepth(DEPTH.NPC);
      npc.setOrigin(0.5, 0.88);
      npc.body.setSize(18, 22);
      npc.body.setOffset(7, 10);
      npc.setCollideWorldBounds(true);

      const shadow = this.scene.add.sprite(obj.x, obj.y + 11, ASSET_KEYS.NPCS, frame * 4);
      shadow.setOrigin(0.5, 0.88);
      shadow.setScale(1.1, 0.24);
      shadow.setTint(0x020617);
      shadow.setAlpha(0.36);
      shadow.setDepth(DEPTH.NPC - 1);

      const outline = this.scene.add.sprite(obj.x, obj.y + 1, ASSET_KEYS.NPCS, frame * 4);
      outline.setOrigin(0.5, 0.88);
      outline.setScale(1.14);
      outline.setTint(0x02131b);
      outline.setAlpha(0.68);
      outline.setDepth(DEPTH.NPC - 0.5);

      npc._shadow = shadow;
      npc._outline = outline;
      const hasQuest = Boolean(def?.dialog?.some((entry) => entry.quest));
      const emoteText = hasQuest ? "!" : "...";
      const emote = this.scene.add.text(obj.x, obj.y - 38, emoteText, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#fef3c7",
        backgroundColor: "rgba(2, 6, 23, 0.82)",
        padding: { x: 5, y: 4 },
        stroke: "#020617",
        strokeThickness: 3,
      });
      emote.setOrigin(0.5);
      emote.setDepth(DEPTH.NPC + 28);
      emote.setAlpha(0.82);

      npc._emote = emote;
      npc._emoteTween = this.scene.tweens.add({
        targets: emote,
        y: emote.y - 5,
        alpha: 1,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      npc.ecoSetHighlight = (active) => {
        npc._outline?.setAlpha(active ? 1 : 0.68);
        npc._emote?.setText(active ? "E" : emoteText);
        npc._emote?.setColor(active ? "#bef264" : "#fef3c7");
        npc._emote?.setScale(active ? 1.14 : 1);
      };

      npc.ecoData = {
        kind: "npc",
        npcId,
        name: def?.name || obj.name || "Warga",
        role: def?.role || "Warga",
        frame,
        areaId: this.getProp(obj, "areaId", "taman_kota"),
        portrait: def?.portrait || DEFAULT_DIALOG.portrait,
        dialog: def?.dialog || DEFAULT_DIALOG.dialog,
        homeX: obj.x,
        homeY: obj.y,
      };

      npc.play(`npc-${frame}-idle`);
      this.group.add(npc);
    });
  }

  wander() {
    if (!this.group) return;
    this.group.getChildren().forEach((npc) => {
      if (!npc.body || !npc.active || Math.random() < 0.35) return;

      const data = npc.ecoData;
      const dx = data.homeX - npc.x;
      const dy = data.homeY - npc.y;
      const distFromHome = Math.hypot(dx, dy);

      // If too far from home, walk back
      if (distFromHome > 60) {
        const angle = Math.atan2(dy, dx);
        npc.setVelocity(
          Math.cos(angle) * NPC_WANDER_SPEED,
          Math.sin(angle) * NPC_WANDER_SPEED
        );
      } else {
        const angle = Math.random() * Math.PI * 2;
        npc.setVelocity(
          Math.cos(angle) * NPC_WANDER_SPEED,
          Math.sin(angle) * NPC_WANDER_SPEED
        );
      }

      this.scene.time.delayedCall(700, () => {
        if (npc.active && npc.body) {
          npc.setVelocity(0, 0);
        }
      });
    });
  }

  update() {
    if (!this.group) return;
    this.group.getChildren().forEach((npc) => {
      if (!npc.active || !npc._shadow) return;
      const depth = Math.max(DEPTH.NPC, Math.floor(npc.y));
      npc._shadow.setPosition(npc.x, npc.y + 10);
      npc._shadow.setFrame(npc.frame.name);
      npc._shadow.setDepth(depth - 2);

      if (npc._outline) {
        npc._outline.setPosition(npc.x, npc.y + 1);
        npc._outline.setFrame(npc.frame.name);
        npc._outline.setDepth(depth - 1);
      }

      if (npc._emote) {
        npc._emote.setPosition(npc.x, npc.y - 38);
        npc._emote.setDepth(depth + 28);
      }

      // Y-sort depth
      npc.setDepth(depth);
    });
  }

  getDialogForNPC(npcId) {
    const def = NPC_DEFINITIONS[npcId];
    if (!def) return DEFAULT_DIALOG.dialog[0];
    // Return a random dialog entry for variety
    const dialogs = def.dialog || DEFAULT_DIALOG.dialog;
    return dialogs[Math.floor(Math.random() * dialogs.length)];
  }

  getProp(object, name, fallback = null) {
    const prop = object?.properties?.find((p) => p.name === name);
    return prop?.value ?? fallback;
  }

  destroy() {
    if (this.group) {
      this.group.getChildren().forEach((npc) => {
        npc._shadow?.destroy();
        npc._outline?.destroy();
        npc._emoteTween?.stop();
        npc._emote?.destroy();
      });
      this.group.destroy(true);
    }
    this.group = null;
  }
}
