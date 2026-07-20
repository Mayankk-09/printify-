"use client";

import { useMemo } from "react";

interface Paper {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function FloatingPapers() {
  const papers: Paper[] = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        x: 10 + i * 22 + (i % 2) * 8,
        y: 15 + (i % 3) * 25,
        size: 44 + (i % 3) * 10,
        duration: 14 + i * 2,
        delay: i * 3,
      })),
    []
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {papers.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 1.3,
            opacity: 0.035,
            animation: `paperFloat${p.id} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 60 78"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <rect
              x="0.5"
              y="0.5"
              width="59"
              height="77"
              fill="white"
              stroke="#000"
              strokeWidth="0.5"
            />
            <line x1="12" y1="18" x2="48" y2="18" stroke="#ccc" strokeWidth="0.8" />
            <line x1="12" y1="26" x2="44" y2="26" stroke="#ccc" strokeWidth="0.8" />
            <line x1="12" y1="34" x2="46" y2="34" stroke="#ccc" strokeWidth="0.8" />
            <line x1="12" y1="42" x2="38" y2="42" stroke="#ccc" strokeWidth="0.8" />
            <line x1="12" y1="50" x2="42" y2="50" stroke="#ccc" strokeWidth="0.8" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes paperFloat0 {
          0%, 100% { transform: translate(0, 0) rotate(-3deg); }
          33% { transform: translate(6px, -8px) rotate(-1deg); }
          66% { transform: translate(-4px, 5px) rotate(-4deg); }
        }
        @keyframes paperFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(-1deg); }
          33% { transform: translate(-5px, 6px) rotate(1deg); }
          66% { transform: translate(6px, -5px) rotate(-2deg); }
        }
        @keyframes paperFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(1deg); }
          33% { transform: translate(4px, -9px) rotate(3deg); }
          66% { transform: translate(-5px, 4px) rotate(-1deg); }
        }
        @keyframes paperFloat3 {
          0%, 100% { transform: translate(0, 0) rotate(2deg); }
          33% { transform: translate(-6px, 5px) rotate(4deg); }
          66% { transform: translate(3px, -7px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
