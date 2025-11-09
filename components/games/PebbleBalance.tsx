// components/games/PebbleBalance.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Pebble Balance (Framer Motion version)
 *
 * - Drag pebbles from tray to stack area.
 * - Pebble "drops" into next slot using a gentle spring.
 * - Stability check: if offset is too large, toppling animation plays.
 * - Win after all pebbles placed and stable for 2 seconds.
 *
 * No external physics library. Designed to be calm & deterministic.
 */

type PebbleModel = {
  id: number;
  width: number; // visual width
  height: number; // visual height
  color: string;
  // runtime dragging / placed state:
  x: number;
  y: number;
  placed: boolean;
  // target positions when placed
  targetX?: number;
  targetY?: number;
  angle?: number;
  toppled?: boolean;
};

const TRAY_Y = 420;
const STACK_X = 300; // x center of stack area
const STACK_BASE_Y = 350; // y coordinate of base stone center
const STACK_MAX_HEIGHT = 260;
const STACK_SPACING = 6; // small gap between stones when stacked
const STABILITY_THRESHOLD = 0.5; // 0..1, fraction of allowable overhang

const COLORS = ["#d6ccc2", "#bdb0a5", "#a79a8f", "#d0c7be", "#c3b8ad"];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makePebble(id: number): PebbleModel {
  const w = Math.round(rand(90, 150));
  const h = Math.round(rand(28, 44));
  return {
    id,
    width: w,
    height: h,
    color: COLORS[id % COLORS.length],
    x: 60 + id * 60,
    y: TRAY_Y,
    placed: false,
    angle: 0,
  };
}

export default function PebbleBalance() {
  const [pebbles, setPebbles] = useState<PebbleModel[]>(
    Array.from({ length: 5 }).map((_, i) => makePebble(i))
  );
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [mouseOffset, setMouseOffset] = useState<{ dx: number; dy: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [placedOrder, setPlacedOrder] = useState<number[]>([]); // ids order bottom->top
  const [toppled, setToppled] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const stableTimer = useRef<number | null>(null);

  // helper to update a pebble by id
  const updatePebble = (id: number, patch: Partial<PebbleModel>) =>
    setPebbles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // pointer handlers
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (draggingId === null) return;
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const off = mouseOffset ?? { dx: 0, dy: 0 };
      updatePebble(draggingId, { x: mouseX - off.dx, y: mouseY - off.dy });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (draggingId === null) return;
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) {
        setDraggingId(null);
        setMouseOffset(null);
        return;
      }
      const pb = pebbles.find((p) => p.id === draggingId);
      if (!pb) {
        setDraggingId(null);
        setMouseOffset(null);
        return;
      }

      // If released over stack area (within centered horizontal area), place it
      const mouseX = e.clientX - rect.left;
      const stackLeft = rect.width / 2 - 140;
      const stackRight = rect.width / 2 + 140;
      if (mouseX >= stackLeft && mouseX <= stackRight) {
        // compute stack target X (centered on board center)
        const centerX = rect.width / 2;
        // determine Y for the next slot based on placedOrder
        const baseY = STACK_BASE_Y;
        const belowIds = placedOrder.slice(); // bottom->top
        // compute stack height so far
        let heightSoFar = 0;
        for (let id of belowIds) {
          const p = pebbles.find((x) => x.id === id)!;
          heightSoFar += p.height + STACK_SPACING;
        }
        const targetY = baseY - heightSoFar;
        const targetX = centerX;

        // Place pebble (snap to stack center)
        updatePebble(draggingId, {
          placed: true,
          targetX,
          targetY,
          x: targetX,
          y: targetY - 200, // start higher visually and animate down (framer-motion will smooth)
        });

        setPlacedOrder((prev) => [...prev, draggingId]);
        // allow animations / stability check after a small delay
        setTimeout(() => checkStability(), 600);
      } else {
        // Return to tray (snap back)
        const original = makePebble(pb.id);
        updatePebble(draggingId, { x: original.x, y: TRAY_Y, placed: false });
      }

      setDraggingId(null);
      setMouseOffset(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingId, mouseOffset, pebbles, placedOrder]);

  // start drag
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = boardRef.current!.getBoundingClientRect();
    const pb = pebbles.find((p) => p.id === id)!;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMouseOffset({ dx: mouseX - pb.x, dy: mouseY - pb.y });
    setDraggingId(id);
    // bring dragged pebble visually to front by reordering pebbles array (last drawn on top)
    setPebbles((prev) => {
      const rest = prev.filter((p) => p.id !== id);
      return [...rest, prev.find((p) => p.id === id)!];
    });
  };

  // stability check after each place: we check each pebble (top->down) for overhang
  const checkStability = () => {
    // if no placed stones or only one, it's stable
    if (placedOrder.length <= 1) {
      scheduleWinCheck();
      return;
    }

    // retrieve placed pebbles bottom -> top
    const placed = placedOrder.map((id) => pebbles.find((p) => p.id === id)!);
    // compute center x for each pebble (we snap to centerX, but user could drop slightly off)
    // For simplicity in this version we allow some lateral offset if user dragged it slightly right/left.
    // We will compute the offset of each pebble relative to the one below.
    let unstable = false;
    for (let i = 1; i < placed.length; i++) {
      const below = placed[i - 1];
      const top = placed[i];
      const allowedOverhang = (below.width - top.width) / 2;
      const actualOffset = Math.abs(top.x - below.x);
      // If narrower below (negative allowedOverhang) use small threshold
      const threshold = Math.max(allowedOverhang * STABILITY_THRESHOLD, 8);
      if (actualOffset > threshold) {
        unstable = true;
        break;
      }
    }

    if (unstable) {
      // topple the top-most unstable portion (we animate a gentle fall)
      playToppleAnimation();
      return;
    }

    scheduleWinCheck();
  };

  const scheduleWinCheck = () => {
    // win when all pebbles placed and stable for 2 seconds
    if (placedOrder.length === pebbles.length) {
      if (stableTimer.current) {
        window.clearTimeout(stableTimer.current);
      }
      stableTimer.current = window.setTimeout(() => {
        setWon(true);
      }, 2000);
    }
  };

  const playToppleAnimation = () => {
    setToppled(true);
    // gently animate top pebble off-screen by marking toppled flag, then show fail modal
    // We mark the topmost placed pebble as toppled so UI can animate it.
    setPlacedOrder((prev) => {
      if (prev.length === 0) return prev;
      const topId = prev[prev.length - 1];
      updatePebble(topId, { toppled: true });
      // remove it from placed list so player has to re-place
      return prev.slice(0, -1);
    });

    setTimeout(() => {
      setToppled(false);
    }, 900);
    // player can continue; do not auto-game-over, just show a gentle nudge
  };

  // reset game
  const reset = () => {
    setPebbles(Array.from({ length: 5 }).map((_, i) => makePebble(i)));
    setPlacedOrder([]);
    setDraggingId(null);
    setToppled(false);
    setWon(false);
    if (stableTimer.current) {
      window.clearTimeout(stableTimer.current);
      stableTimer.current = null;
    }
  };

  // when a pebble is marked placed (placed: true), we animate it down with CSS/Framer Motion
  // We derive the render order: tray pebbles first, then stack bottom->top.
  const renderStack = () => {
    // order to render: all pebbles by their appearance in pebbles[], so last elements draw on top
    return pebbles.map((p) => {
      const isDragging = draggingId === p.id;
      const isPlaced = placedOrder.includes(p.id);
      const topIndex = placedOrder.indexOf(p.id);
      // compute visual Y if placed: targetY is computed from base and heights
      let visualY = p.y;
      if (isPlaced) {
        // recompute proper stacked position based on current placedOrder
        const ordered = placedOrder.map((id) => pebbles.find((x) => x.id === id)!);
        let y = STACK_BASE_Y;
        for (let i = 0; i < ordered.length; i++) {
          const q = ordered[i];
          if (q.id === p.id) {
            visualY = y - q.height / 2;
            break;
          }
          y -= q.height + STACK_SPACING;
        }
      }

      const centerX = boardRef.current ? (boardRef.current.getBoundingClientRect().width / 2) : STACK_X;

      return (
        <motion.div
          key={p.id}
          onPointerDown={(e) => handlePointerDown(e, p.id)}
          style={{
            position: "absolute",
            left: p.placed ? (p.x ?? centerX) - p.width / 2 : p.x - p.width / 2,
            top: visualY - p.height / 2,
            width: p.width,
            height: p.height,
            borderRadius: p.height,
            background: `linear-gradient(180deg, ${p.color}, rgba(0,0,0,0.04))`,
            boxShadow: "0 10px 24px rgba(16,24,40,0.12)",
            cursor: isDragging ? "grabbing" : "grab",
            zIndex: isDragging ? 999 : p.placed ? 100 + topIndex : p.id,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            transform: p.toppled ? "rotate(30deg) translateY(80px) translateX(40px)" : undefined,
          }}
          animate={{
            left: p.placed ? (p.x ?? centerX) - p.width / 2 : p.x - p.width / 2,
            top: visualY - p.height / 2,
            rotate: p.toppled ? 22 : 0,
            scale: isDragging ? 1.03 : 1,
          }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        />
      );
    });
  };

  // board bounding ref used for pointer math
  useEffect(() => {
    const onResize = () => {
      if (!boardRef.current) return;
      // Resize handler - can be used for future responsive updates
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pebble Balance</h3>
          <p className="text-sm text-muted-foreground">Drag pebbles from the tray and place them gently on the stack. Keep them centered for stability.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20">Reset</button>
        </div>
      </div>

      <div
        ref={boardRef}
        className="relative bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-100"
        style={{ height: 520, overflow: "hidden" }}
      >
        {/* gentle riverbed background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="1" />
                <stop offset="100%" stopColor="#eef2ff" stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g1)" />
          </svg>
        </div>

        {/* stack target area indicator (center) */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: STACK_BASE_Y - 16,
          transform: "translateX(-50%)",
          width: 220,
          height: 40,
          borderRadius: 20,
          background: "rgba(99,102,241,0.04)",
          border: "1px dashed rgba(99,102,241,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none"
        }}>
          <div style={{ fontSize: 12, color: "#475569" }}>Stack area — place stones here</div>
        </div>

        {/* tray at bottom */}
        <div style={{
          position: "absolute", left: 16, right: 16, top: TRAY_Y + 20, display: "flex", gap: 12, justifyContent: "flex-start", alignItems: "center", pointerEvents: "none"
        }}>
          <div style={{ fontSize: 13, color: "#475569", marginLeft: 6 }}>Tray</div>
        </div>

        {/* render pebbles */}
        <div style={{ position: "absolute", inset: 0 }}>
          {renderStack()}
        </div>
      </div>

      <AnimatePresence>
        {toppled && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-center text-rose-600">
            Oops — that one toppled. Try again gently.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm">
              <div className="text-3xl mb-2">🌿</div>
              <h4 className="text-xl font-semibold mb-2">You found your balance</h4>
              <p className="text-sm text-slate-600 mb-4">Nice — you stacked them calmly. Take a slow breath.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => { reset(); }} className="px-4 py-2 bg-primary/10 rounded-md">Play again</button>
                <button onClick={() => setWon(false)} className="px-4 py-2 bg-white border rounded-md">Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
