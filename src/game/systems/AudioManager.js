/**
 * AudioManager — Handles ambient music, SFX playback, and area-based soundscapes
 *
 * Ported from the legacy GameCanvas monolith into a clean manager class.
 * Requires user interaction (click/keypress) before audio can start (browser policy).
 */

import { ASSET_KEYS } from "../config/AssetManifest";

const AREA_AUDIO_PROFILES = {
  hutan:              { ambientVolume: 0.22, footstepVolume: 0.10 },
  danau:              { ambientVolume: 0.20, footstepVolume: 0.08 },
  sungai:             { ambientVolume: 0.18, footstepVolume: 0.08 },
  pantai:             { ambientVolume: 0.14, footstepVolume: 0.06 },
  taman_kota:         { ambientVolume: 0.16, footstepVolume: 0.10 },
  camping_ground:     { ambientVolume: 0.20, footstepVolume: 0.10 },
  _default:           { ambientVolume: 0.12, footstepVolume: 0.10 },
};

export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.ambientSound = null;
    this.sfx = {};
    this.audioStarted = false;
    this.currentAudioArea = "";
    this.lastFootstepAt = 0;
  }

  init() {
    this.scene.sound.pauseOnBlur = true;

    this.ambientSound = this.scene.sound.add(ASSET_KEYS.AMBIENT, {
      loop: true,
      volume: 0.15,
    });

    this.sfx = {
      collect:    this.scene.sound.add(ASSET_KEYS.SFX_COLLECT,   { volume: 0.35 }),
      interact:   this.scene.sound.add(ASSET_KEYS.SFX_INTERACT,  { volume: 0.28 }),
      recycle:    this.scene.sound.add(ASSET_KEYS.SFX_RECYCLE,    { volume: 0.35 }),
      error:      this.scene.sound.add(ASSET_KEYS.SFX_ERROR,      { volume: 0.24 }),
      footstep:   this.scene.sound.add(ASSET_KEYS.SFX_FOOTSTEP,   { volume: 0.12 }),
      dialogBlip: this.scene.sound.add(ASSET_KEYS.SFX_DIALOG,     { volume: 0.09 }),
      levelUp:    this.scene.sound.add(ASSET_KEYS.SFX_LEVEL_UP,   { volume: 0.32 }),
    };

    // Start ambient on first user interaction (browser autoplay policy)
    const startAmbient = () => {
      if (this.audioStarted || !this.ambientSound) return;
      this.audioStarted = true;
      try {
        this.ambientSound.play();
      } catch (_e) {
        this.audioStarted = false;
      }
    };

    this.scene.input.once("pointerdown", startAmbient);
    this.scene.input.keyboard?.once("keydown", startAmbient);
  }

  /**
   * Play a named SFX. Silently fails if the key doesn't exist.
   */
  play(key) {
    try {
      this.sfx?.[key]?.play();
    } catch (_e) {
      // ignore — audio context might not be ready
    }
  }

  /**
   * Play footstep SFX with a cooldown to avoid spamming.
   */
  playFootstep(now) {
    if (now - this.lastFootstepAt > 340) {
      this.lastFootstepAt = now;
      this.play("footstep");
    }
  }

  /**
   * Crossfade ambient volume and footstep volume when entering a new area.
   */
  updateAreaSoundscape(areaId) {
    if (this.currentAudioArea === areaId) return;
    this.currentAudioArea = areaId;
    const profile = AREA_AUDIO_PROFILES[areaId] || AREA_AUDIO_PROFILES._default;

    if (this.ambientSound) {
      this.scene.tweens.add({
        targets: this.ambientSound,
        volume: profile.ambientVolume,
        duration: 700,
      });
    }
    if (this.sfx?.footstep) {
      this.sfx.footstep.volume = profile.footstepVolume;
    }
  }

  destroy() {
    this.ambientSound?.stop();
    this.ambientSound?.destroy();
    Object.values(this.sfx || {}).forEach((sound) => sound?.destroy());
    this.sfx = {};
    this.ambientSound = null;
  }
}
