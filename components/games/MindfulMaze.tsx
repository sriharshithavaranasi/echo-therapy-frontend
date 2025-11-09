"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CELL_SIZE = 40;
const ROWS = 10;
const COLS = 10;
const MOVE_SPEED = 0.15;

const generateMaze = (rows: number, cols: number) => {
  const maze = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(1));

  const carve = (r: number, c: number) => {
    maze[r][c] = 0;
    const directions = [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (let [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr > 0 &&
        nr < rows - 1 &&
        nc > 0 &&
        nc < cols - 1 &&
        maze[nr][nc] === 1
      ) {
        maze[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  };

  carve(1, 1);
  maze[rows - 2][cols - 2] = 0;
  return maze;
};

const MindfulMaze: React.FC = () => {
  const [maze, setMaze] = useState(generateMaze(ROWS, COLS));
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [target, setTarget] = useState({ x: 1, y: 1 });
  const [finished, setFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const move = (dx: number, dy: number) => {
    if (finished) return;
    const newX = target.x + dx;
    const newY = target.y + dy;
    if (
      newX >= 0 &&
      newX < COLS &&
      newY >= 0 &&
      newY < ROWS &&
      maze[newY][newX] === 0
    ) {
      setTarget({ x: newX, y: newY });
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [target, finished]);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setPos((prev) => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.01) {
          if (target.x === COLS - 2 && target.y === ROWS - 2 && !finished) {
            setFinished(true);
          }
          return target;
        }
        return {
          x: prev.x + dx * MOVE_SPEED,
          y: prev.y + dy * MOVE_SPEED,
        };
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  const resetMaze = () => {
    setMaze(generateMaze(ROWS, COLS));
    setPos({ x: 1, y: 1 });
    setTarget({ x: 1, y: 1 });
    setFinished(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-100 to-blue-200"
    >
      <h1 className="text-3xl font-semibold text-indigo-700 mb-4">
        Mindful Maze
      </h1>

      <div
        className="relative"
        style={{
          width: COLS * CELL_SIZE,
          height: ROWS * CELL_SIZE,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {maze.flatMap((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell ? "#1e3a8a" : "transparent",
                transition: "background-color 0.3s ease",
              }}
            />
          ))
        )}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-indigo-500 shadow-lg"
          animate={{
            left: pos.x * CELL_SIZE + CELL_SIZE / 4,
            top: pos.y * CELL_SIZE + CELL_SIZE / 4,
          }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
          style={{
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.8)",
          }}
        />
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="text-4xl mb-4"
              >
                🌿
              </motion.div>
              <h2 className="text-2xl font-semibold text-indigo-700 mb-2">
                You found your calm center
              </h2>
              <p className="text-gray-600 mb-4">
                Take a deep breath. You made it through the maze.
              </p>
              <button
                onClick={resetMaze}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MindfulMaze;
