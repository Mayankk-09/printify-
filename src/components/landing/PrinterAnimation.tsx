"use client";

import { useState, useEffect } from "react";

export default function PrinterAnimation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const durations = [1800, 1400, 1200, 1600, 1400];
    let timeout: ReturnType<typeof setTimeout>;

    const cycle = () => {
      timeout = setTimeout(() => {
        setPhase((p) => (p + 1) % 5);
        cycle();
      }, durations[phase]);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, [phase]);

  const showPaper = phase === 0 || phase === 1 || phase === 4;
  const paperEntering = phase === 0;
  const paperInside = phase === 1;
  const blinkOn = phase === 2;
  const paperExiting = phase === 3;
  const paperStacked = phase === 4;

  return (
    <div
      style={{
        width: 180,
        height: 140,
        position: "relative",
        margin: "0 auto",
      }}
      role="img"
      aria-label="Animated printer illustration"
    >
      <svg
        viewBox="0 0 180 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="180"
        height="140"
      >
        {/* Table surface */}
        <line x1="10" y1="118" x2="170" y2="118" stroke="#000" strokeWidth="1" />

        {/* Printer body */}
        <rect x="35" y="62" width="110" height="48" rx="1" stroke="#000" strokeWidth="1.2" fill="#fff" />

        {/* Printer top feeder */}
        <rect x="52" y="52" width="76" height="14" rx="1" stroke="#000" strokeWidth="1" fill="#fff" />

        {/* Input document (paper appearing from top) */}
        {showPaper && (
          <g
            style={{
              transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
              transform: paperEntering
                ? "translateY(0)"
                : paperInside
                ? "translateY(18px)"
                : paperStacked
                ? "translateY(68px)"
                : "translateY(18px)",
              opacity: paperExiting ? 0 : 1,
            }}
          >
            <rect
              x="65"
              y="18"
              width="50"
              height="38"
              rx="0.5"
              fill="#F9F9F6"
              stroke="#000"
              strokeWidth="0.8"
            />
            <line x1="72" y1="28" x2="108" y2="28" stroke="#ccc" strokeWidth="0.6" />
            <line x1="72" y1="34" x2="100" y2="34" stroke="#ccc" strokeWidth="0.6" />
            <line x1="72" y1="40" x2="104" y2="40" stroke="#ccc" strokeWidth="0.6" />
            <line x1="72" y1="46" x2="96" y2="46" stroke="#ccc" strokeWidth="0.6" />
          </g>
        )}

        {/* Output paper exiting bottom */}
        {(paperExiting || paperStacked) && (
          <g
            style={{
              transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1)",
              transform: paperStacked ? "translateY(4px)" : "translateY(0)",
            }}
          >
            <rect
              x="55"
              y="106"
              width="70"
              height="12"
              rx="0.5"
              fill="#F9F9F6"
              stroke="#000"
              strokeWidth="0.8"
            />
          </g>
        )}

        {/* Stacked papers on output tray */}
        <rect x="52" y="108" width="76" height="8" rx="1" stroke="#000" strokeWidth="0.8" fill="#fff" />

        {/* Printer indicator light */}
        <circle
          cx="48"
          cy="76"
          r="3"
          fill={blinkOn ? "#000" : "#F9F9F6"}
          stroke="#000"
          strokeWidth="1"
          style={{ transition: "fill 0.3s ease" }}
        />

        {/* Paper feed slot lines */}
        <line x1="58" y1="58" x2="122" y2="58" stroke="#ccc" strokeWidth="0.5" />

        {/* Output slot lines */}
        <line x1="55" y1="106" x2="125" y2="106" stroke="#ccc" strokeWidth="0.5" />

        {/* Printer legs */}
        <line x1="45" y1="110" x2="45" y2="118" stroke="#000" strokeWidth="1" />
        <line x1="135" y1="110" x2="135" y2="118" stroke="#000" strokeWidth="1" />
      </svg>
    </div>
  );
}
