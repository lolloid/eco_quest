"use client";

/**
 * GameWrapper — Clean React wrapper for the Phaser game
 *
 * Replaces the monolithic GameCanvas.jsx with a clean architecture:
 * - Phaser renders the game world ONLY
 * - React renders ALL overlay UI
 * - EventBus bridges communication
 */

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import { getClientAuthToken } from "@/lib/demoAuth";
import { ACTIONS } from "@/domain/actions";
import EventBus, { EVENTS } from "@/game/events/EventBus";
import { TRASH_CATEGORIES } from "@/game/config/TrashData";
import { clamp, getWorldAverage, normalizeInventory, getTotalItems } from "@/game/config/WorldData";
import { INVENTORY_CAPACITY } from "@/game/config/GameConfig";

import GameHUD from "./GameHUD";
import DialogOverlay from "./DialogOverlay";
import InventoryOverlay from "./InventoryOverlay";
import MiniMapOverlay from "./MiniMapOverlay";
import QuestTracker from "./QuestTracker";
import RewardPopup from "./RewardPopup";
import InteractionPrompt from "./InteractionPrompt";
import PixelIcon from "@/components/ui/PixelIcon";

function makeClientEventId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function incrementTrashInventory(inventory, trashType, rarity = "common") {
  const normalizedType = String(trashType || "plastic").toLowerCase();
  const itemId = `trash_${normalizedType}`;
  let found = false;
  const next = (inventory || []).map((item) => {
    if ((item.trashType || item.itemId?.replace("trash_", "")) !== normalizedType) return item;
    found = true;
    return {
      ...item,
      itemId: item.itemId || itemId,
      type: item.type || "trash",
      trashType: normalizedType,
      rarity: item.rarity || rarity,
      quantity: (item.quantity || 0) + 1,
    };
  });

  if (!found) {
    next.push({
      itemId,
      type: "trash",
      trashType: normalizedType,
      rarity,
      quantity: 1,
    });
  }

  return next;
}

function mergeInventoryMax(serverInventory, optimisticInventory) {
  const byType = new Map();
  [...(serverInventory || []), ...(optimisticInventory || [])].forEach((item) => {
    const type = item.trashType || item.itemId?.replace("trash_", "");
    if (!type) return;
    const existing = byType.get(type);
    if (!existing || (item.quantity || 0) > (existing.quantity || 0)) {
      byType.set(type, { ...item, trashType: type, itemId: item.itemId || `trash_${type}` });
    }
  });
  return Array.from(byType.values());
}

function MobileGameControls({ onOpenInventory, inventoryCount }) {
  const joystickRef = useRef(null);
  const joystickPointerRef = useRef(null);
  const [joystick, setJoystick] = useState({ x: 0, y: 0, active: false });
  const [controlsActive, setControlsActive] = useState(true);
  const idleTimerRef = useRef(null);

  const wakeControls = useCallback(() => {
    setControlsActive(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setControlsActive(false), 2600);
  }, []);

  const emitMove = useCallback((x, y) => {
    EventBus.emit(EVENTS.PLAYER_MOVE, { x, y });
  }, []);

  const updateJoystick = useCallback((event) => {
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const radius = rect.width / 2;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const distance = Math.min(radius, Math.hypot(rawX, rawY));
    const angle = Math.atan2(rawY, rawX);
    const knobX = Math.cos(angle) * distance;
    const knobY = Math.sin(angle) * distance;
    const normalizedX = Math.abs(knobX / radius) < 0.08 ? 0 : knobX / radius;
    const normalizedY = Math.abs(knobY / radius) < 0.08 ? 0 : knobY / radius;

    setJoystick({ x: knobX, y: knobY, active: true });
    emitMove(normalizedX, normalizedY);
    wakeControls();
  }, [emitMove, wakeControls]);

  const stopAll = useCallback(() => {
    joystickPointerRef.current = null;
    setJoystick({ x: 0, y: 0, active: false });
    emitMove(0, 0);
  }, [emitMove]);

  const startJoystick = useCallback((event) => {
    event.preventDefault();
    joystickPointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateJoystick(event);
  }, [updateJoystick]);

  const moveJoystick = useCallback((event) => {
    if (joystickPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    updateJoystick(event);
  }, [updateJoystick]);

  const endJoystick = useCallback((event) => {
    if (joystickPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    stopAll();
  }, [stopAll]);

  useEffect(() => {
    wakeControls();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      stopAll();
    };
  }, [stopAll, wakeControls]);

  const requestInteract = () => EventBus.emit(EVENTS.INTERACTION_REQUEST);
  const requestRecycle = () => EventBus.emit(EVENTS.RECYCLE_REQUEST);

  return (
    <div className={`mobile-game-controls ${controlsActive || joystick.active ? "" : "is-idle"}`} aria-label="Mobile game controls">
      <div
        ref={joystickRef}
        className={`mobile-joystick ${joystick.active ? "is-active" : ""}`}
        onPointerDown={startJoystick}
        onPointerMove={moveJoystick}
        onPointerUp={endJoystick}
        onPointerCancel={endJoystick}
        aria-label="Analog movement joystick"
        role="application"
      >
        <span className="mobile-joystick-grid" />
        <span
          className="mobile-joystick-knob"
          style={{ transform: `translate(calc(-50% + ${joystick.x}px), calc(-50% + ${joystick.y}px))` }}
        />
      </div>

      <div className="mobile-action-pad">
        <button type="button" className="mobile-action-btn is-primary" onPointerDown={() => { wakeControls(); requestInteract(); }} aria-label="Interact">
          <PixelIcon type="rpg" className="is-tiny" />
        </button>
        <button type="button" className="mobile-action-btn" onPointerDown={() => { wakeControls(); requestRecycle(); }} aria-label="Recycle">
          <PixelIcon type="recycle" className="is-tiny" />
        </button>
        <button type="button" className="mobile-action-btn" onClick={() => { wakeControls(); onOpenInventory(); }} aria-label={`Inventory ${inventoryCount}/${INVENTORY_CAPACITY}`}>
          <PixelIcon type="trash" className="is-tiny" />
        </button>
      </div>
    </div>
  );
}

export default function GameWrapper({ userId, profile }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const initIdRef = useRef(0);
  const mountedRef = useRef(false);
  const inventoryRef = useRef([]);

  // UI State
  const [score, setScore] = useState(profile?.totalEcoPoints || 0);
  const [trashLeft, setTrashLeft] = useState(0);
  const [totalTrash, setTotalTrash] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [worldAreas, setWorldAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState("Taman Kota");
  const [currentAreaId, setCurrentAreaId] = useState("taman_kota");
  const [dialog, setDialog] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [gameError, setGameError] = useState("");
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 320 });
  const [interactionPrompt, setInteractionPrompt] = useState(null);
  const [rewardPopup, setRewardPopup] = useState(null);
  const [gameReady, setGameReady] = useState(false);

  // Derived state
  const inventoryCount = useMemo(() => getTotalItems(inventory), [inventory]);
  const inventoryStacks = useMemo(() => normalizeInventory(inventory), [inventory]);
  const worldAverage = useMemo(() => getWorldAverage(worldAreas), [worldAreas]);
  const collectedTrash = Math.max(0, totalTrash - trashLeft);
  const currentAreaData = useMemo(
    () => worldAreas.find((a) => a.id === currentAreaId) || worldAreas[0],
    [currentAreaId, worldAreas]
  );
  const currentCleanliness = currentAreaData?.cleanlinessScore ?? worldAverage;

  // Keep ref in sync
  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  // Push cleanliness changes to Phaser
  useEffect(() => {
    EventBus.emit(EVENTS.WORLD_CLEANLINESS, { cleanliness: currentCleanliness });
  }, [currentCleanliness]);

  // Reward popup auto-dismiss
  useEffect(() => {
    if (!rewardPopup) return;
    const t = setTimeout(() => setRewardPopup(null), 2000);
    return () => clearTimeout(t);
  }, [rewardPopup]);

  useEffect(() => {
    if (dialog || showInventory) return;

    const onKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || event.target?.isContentEditable) return;
      if (key === "e") {
        event.preventDefault();
        EventBus.emit(EVENTS.INTERACTION_REQUEST);
      }
      if (key === "r") {
        event.preventDefault();
        EventBus.emit(EVENTS.RECYCLE_REQUEST);
      }
      if (key === "tab") {
        event.preventDefault();
        setShowInventory(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, showInventory]);

  // === API Helpers ===
  const getToken = useCallback(async () => {
    return getClientAuthToken(profile?.isDemo ? { ...profile, isDemo: true } : auth.currentUser);
  }, [profile]);

  const loadInventory = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setInventory(data.inventory || []);
      return data.inventory || [];
    } catch (err) {
      console.error("Failed to load inventory:", err);
      return [];
    }
  }, [getToken]);

  const loadWorld = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/world", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setWorldAreas(data.areas || []);
      return data.areas || [];
    } catch (err) {
      console.error("Failed to load world:", err);
      return [];
    }
  }, [getToken]);

  const postGameEvent = useCallback(async (action, metadata) => {
    const token = await getToken();
    const res = await fetch("/api/game/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        metadata: {
          ...metadata,
          clientEventId: metadata.clientEventId || makeClientEventId(action.toLowerCase()),
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.accepted) {
      throw new Error(data.reason || data.error || "Action rejected");
    }
    return data;
  }, [getToken]);

  const recycleItem = useCallback(async (station) => {
    const currentInv = inventoryRef.current || [];
    const accepted = station.accepts || [];
    const matchingItem = currentInv.find(
      (e) => accepted.includes(e.trashType) && (e.quantity || 0) > 0
    );

    if (!matchingItem) {
      const anyItem = currentInv.find((e) => (e.quantity || 0) > 0);
      if (anyItem) {
        setRewardPopup({ type: "penalty", text: "Salah kategori recycle!" });
        toast.error(`${TRASH_CATEGORIES[anyItem.trashType]?.label || "Item"} tidak cocok untuk ${station.label}.`);
      } else {
        toast.error("Inventory kosong. Kumpulkan sampah dulu.");
      }
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch("/api/recycle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trashType: matchingItem.trashType,
          areaId: station.areaId,
          stationId: station.stationId,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        toast.error(data.message || "Recycle gagal.");
        return;
      }

      await Promise.all([loadInventory(), loadWorld()]);
      setScore((v) => v + (data.reward || 0));
      setRewardPopup({ type: "reward", text: `+${data.reward} EcoPoints` });
      toast.success(`${TRASH_CATEGORIES[matchingItem.trashType]?.label || "Item"} berhasil diproses!`);
    } catch (err) {
      console.error("Recycle failed:", err);
      toast.error("Recycle gagal.");
    }
  }, [getToken, loadInventory, loadWorld]);

  // === PHASER GAME LIFECYCLE ===
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !userId) return;

    const initId = ++initIdRef.current;
    mountedRef.current = true;
    let cancelled = false;
    const unsubs = [];

    const isAlive = () => mountedRef.current && !cancelled && initIdRef.current === initId;

    const destroyGame = () => {
      if (gameRef.current) {
        try {
          const scenes = gameRef.current.scene.getScenes(true);
          scenes.forEach((s) => { if (s.shutdown) s.shutdown(); });
          gameRef.current.destroy(true);
        } catch (e) {
          console.warn("[GameWrapper] Destroy error:", e);
        }
        gameRef.current = null;
      }
      if (containerRef.current) containerRef.current.replaceChildren();
    };

    destroyGame();
    setGameError("");
    setDialog(null);
    setInteractionPrompt(null);
    setGameReady(false);

    const initGame = async () => {
      // Load initial data
      await Promise.all([loadInventory(), loadWorld()]);
      if (!isAlive()) return;

      // Register listeners BEFORE Phaser starts. EcoWorldScene can emit GAME_READY
      // during scene creation, so late listeners can leave the React loading overlay stuck.
      unsubs.push(EventBus.on(EVENTS.GAME_READY, (data) => {
        if (!isAlive()) return;
        setTotalTrash(data.trashTotal || 0);
        setTrashLeft(data.trashRemaining || 0);
        setGameReady(true);
      }));

      unsubs.push(EventBus.on(EVENTS.PLAYER_POSITION, (data) => {
        if (!isAlive()) return;
        setPlayerPosition({ x: data.x, y: data.y });
        setCurrentArea(data.areaName);
        setCurrentAreaId(data.areaId);
      }));

      unsubs.push(EventBus.on(EVENTS.INTERACTION_PROMPT, (data) => {
        if (isAlive()) setInteractionPrompt(data);
      }));

      unsubs.push(EventBus.on(EVENTS.INTERACTION_CLEAR, () => {
        if (isAlive()) setInteractionPrompt(null);
      }));

      unsubs.push(EventBus.on(EVENTS.DIALOG_OPEN, (data) => {
        if (isAlive()) setDialog(data);
      }));

      unsubs.push(EventBus.on(EVENTS.INVENTORY_OPEN, () => {
        if (isAlive()) setShowInventory(true);
      }));

      unsubs.push(EventBus.on(EVENTS.TRASH_COLLECTED, async (data) => {
        if (!isAlive()) return;
        const optimisticInventory = incrementTrashInventory(
          inventoryRef.current,
          data.trashType,
          data.rarity
        );
        setInventory(optimisticInventory);

        try {
          const result = await postGameEvent(ACTIONS.COLLECT_TRASH, {
            trashType: data.trashType,
            areaId: data.areaId,
            rarity: data.rarity,
            source: "phaser_tilemap",
            clientEventId: makeClientEventId(`trash_${data.variantId}`),
          });
          if (!isAlive()) return;

          setScore((v) => v + (result.reward?.ecoPoints || 0));
          setRewardPopup({ type: "reward", text: `+${result.reward?.ecoPoints || 0} EcoPoints` });
          const [serverInventory] = await Promise.all([loadInventory(), loadWorld()]);
          if (isAlive()) {
            setInventory(mergeInventoryMax(serverInventory, optimisticInventory));
          }
        } catch (err) {
          console.error("Collect trash failed:", err);
          await loadInventory();
          toast.error(err.message === "COOLDOWN" ? "Tunggu sebentar..." : "Gagal mengambil sampah.");
        }
      }));

      unsubs.push(EventBus.on(EVENTS.TRASH_COUNT, (data) => {
        if (!isAlive()) return;
        setTotalTrash(data.total);
        setTrashLeft(data.remaining);
      }));

      unsubs.push(EventBus.on(EVENTS.RECYCLE_START, async (data) => {
        if (!isAlive()) return;
        await recycleItem(data);
      }));

      unsubs.push(EventBus.on(EVENTS.REWARD_POPUP, (data) => {
        if (!isAlive()) return;
        setRewardPopup(data);
      }));

      // Dynamic import game creator
      const { createGame } = await import("@/game/index");
      if (!isAlive() || !containerRef.current) return;

      // Create game
      containerRef.current.replaceChildren();
      const game = await createGame(containerRef.current);
      if (!isAlive()) {
        game?.destroy(true);
        if (containerRef.current) containerRef.current.replaceChildren();
        return;
      }
      gameRef.current = game;

      // Store cleanup
      game._eventUnsubs = unsubs;
    };

    initGame().catch((err) => {
      if (!isAlive()) return;
      console.error("Failed to initialize game:", err);
      setGameError("Game gagal dimuat. Silakan refresh halaman.");
      destroyGame();
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      initIdRef.current++;

      // Cleanup EventBus listeners
      unsubs.forEach((unsub) => unsub());
      destroyGame();
    };
  }, [userId, profile?.displayName, loadInventory, loadWorld, postGameEvent, recycleItem]);

  // === RENDER ===
  return (
    <div
      className="game-world-frame relative h-[calc(100svh-5rem)] w-full overflow-hidden border border-emerald-400/20 bg-[#0a1a12] shadow-2xl"
      style={{ minHeight: "min(560px, calc(100svh - 96px))" }}
    >
      <div className="game-ambient-backdrop" aria-hidden="true" />
      {/* Phaser Canvas Container */}
      <div
        id="phaser-game-container"
        ref={containerRef}
        className="absolute inset-0 h-full w-full overflow-hidden bg-[#0a1a12]"
        style={{ touchAction: "none" }}
      />

      {/* HUD Overlay */}
      {gameReady && (
        <GameHUD
          profile={profile}
          score={score}
          trashLeft={trashLeft}
          currentCleanliness={currentCleanliness}
          currentArea={currentArea}
          collectedTrash={collectedTrash}
          totalTrash={totalTrash}
          inventoryCount={inventoryCount}
          onOpenInventory={() => setShowInventory(true)}
        />
      )}

      {/* Mini Map */}
      {gameReady && (
        <MiniMapOverlay playerPosition={playerPosition} currentArea={currentArea} />
      )}

      {/* Quest Tracker */}
      {gameReady && (
        <QuestTracker
          collectedTrash={collectedTrash}
          totalTrash={totalTrash}
        />
      )}

      {/* Interaction Prompt */}
      <InteractionPrompt prompt={interactionPrompt} />

      {/* Reward Popup */}
      <RewardPopup popup={rewardPopup} />

      {/* Dialog Box */}
      {dialog && (
        <DialogOverlay
          dialog={dialog}
          onClose={() => setDialog(null)}
          onAccept={() => {
            if (dialog.quest) {
              toast.success(`Quest diterima: ${dialog.quest.title}`);
              postGameEvent(ACTIONS.TALK_NPC, {
                npcId: dialog.npcId,
                areaId: currentAreaId,
                source: "phaser_tilemap",
                clientEventId: makeClientEventId(`npc_${dialog.npcId}`),
              }).catch(() => {});
            }
            setDialog(null);
          }}
        />
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <InventoryOverlay
          inventoryStacks={inventoryStacks}
          categories={TRASH_CATEGORIES}
          capacity={INVENTORY_CAPACITY}
          total={inventoryCount}
          onClose={() => setShowInventory(false)}
        />
      )}

      <MobileGameControls
        inventoryCount={inventoryCount}
        onOpenInventory={() => setShowInventory(true)}
      />

      {/* Error State */}
      {gameError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-6 text-center">
          <div>
            <p className="font-pixel text-sm text-red-400">{gameError}</p>
            <p className="mt-2 text-xs text-gray-500">Coba refresh halaman atau kembali dari dashboard.</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!gameReady && !gameError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a1a12]">
          <div className="text-center">
            <div className="mb-4 flex justify-center animate-bounce">
              <PixelIcon type="leaf" className="is-large" />
            </div>
            <p className="font-pixel text-xs text-emerald-400 animate-pulse">Loading EcoQuest...</p>
          </div>
        </div>
      )}
    </div>
  );
}
