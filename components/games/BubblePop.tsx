"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bubble {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
}

const colors = [
  "rgba(255, 182, 193, 0.6)", // light pink
  "rgba(173, 216, 230, 0.6)", // light blue
  "rgba(144, 238, 144, 0.6)", // light green
  "rgba(255, 255, 224, 0.6)", // light yellow
  "rgba(221, 160, 221, 0.6)", // plum
];

export default function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // periodically add bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      const newBubble: Bubble = {
        id: Date.now(),
        x: Math.random() * 100, // random horizontal position
        size: 40 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 8 + Math.random() * 5, // how long it floats
      };
      setBubbles((prev) => [...prev, newBubble]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // pop bubble
  const handlePop = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-sky-100 to-blue-200 overflow-hidden rounded-2xl flex items-center justify-center">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{
              y: 500, // start below the screen
              opacity: 0.7,
            }}
            animate={{
              y: -100, // float upwards
              opacity: 1,
              transition: {
                duration: bubble.duration,
                ease: "easeInOut",
              },
            }}
            exit={{
              scale: 1.3,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            onClick={() => handlePop(bubble.id)}
            className="absolute rounded-full cursor-pointer"
            style={{
              left: `${bubble.x}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              backgroundColor: bubble.color,
              boxShadow: `0 0 10px ${bubble.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 text-sky-800 font-medium text-sm">
        💨 Tap the bubbles to pop them — breathe and relax.
      </div>
    </div>
  );
}
