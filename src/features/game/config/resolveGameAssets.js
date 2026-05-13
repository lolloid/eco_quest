import { PIXELTERRA_ASSET_SLOTS } from "@/features/game/config/professionalAssetManifest";

const PROFESSIONAL_ASSET_FLAG = process.env.NEXT_PUBLIC_USE_PROFESSIONAL_GAME_ASSETS === "true";

function resolveSlot(slotName) {
  const slot = PIXELTERRA_ASSET_SLOTS[slotName];
  if (!slot) return "";
  return PROFESSIONAL_ASSET_FLAG && slot.target ? slot.target : slot.current;
}

export function resolveGameAssets() {
  return {
    map: resolveSlot("map"),
    tiles: resolveSlot("tiles"),
    hero: resolveSlot("hero"),
    trash: resolveSlot("trash"),
    npcs: resolveSlot("npcs"),
    stations: resolveSlot("stations"),
    animals: "/assets/pixel/ecoquest-pro/sprites/animals.png",
    ui: {
      tiles: resolveSlot("uiTiles"),
      panel: resolveSlot("uiPanel"),
      button: resolveSlot("uiButton"),
    },
    audio: {
      ambient: resolveSlot("ambientAudio"),
      collect: resolveSlot("collectAudio"),
      interact: resolveSlot("interactAudio"),
      recycle: resolveSlot("recycleAudio"),
      error: resolveSlot("errorAudio"),
      footstep: resolveSlot("footstepAudio"),
      dialogBlip: resolveSlot("dialogBlipAudio"),
      uiHover: resolveSlot("uiHoverAudio"),
      levelUp: resolveSlot("levelUpAudio"),
    },
  };
}

export function getProfessionalAssetMode() {
  return PROFESSIONAL_ASSET_FLAG;
}
