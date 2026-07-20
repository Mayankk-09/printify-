"use client";

import { useEffect, useState } from "react";
import { useInView } from "./useInView";
import S from "./landingStyles";

const stages = [
  { label: "Uploading", pct: 60 },
  { label: "Processing", pct: 85 },
  { label: "Printing", pct: 100 },
  { label: "Ready ✓", pct: 100 },
];

export default function PrintProgress() {
  const { ref, inView } = useInView(0.15);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setActive((p) => (p + 1) % stages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 36, ...S.fadeInUp(inView, 0) }}>
        <p style={S.eyebrow()}>LIVE QUEUE</p>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginTop: 8,
            color: "#000",
          }}
        >
          Print queue status
        </h2>
      </div>

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          border: "1px solid #e0e0e0",
          background: "#fff",
          padding: 28,
          ...S.fadeInUp(inView, 0.1),
        }}
      >
        {stages.map((s, i) => {
          const isActive = i === active;
          const isDone = i < active;
          return (
            <div
              key={s.label}
              style={{
                marginBottom: i < stages.length - 1 ? 20 : 0,
                opacity: isActive || isDone ? 1 : 0.35,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: isActive ? "#000" : "#888",
                  }}
                >
                  {s.label}
                </span>
                {isDone && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.55rem",
                      color: "#888",
                    }}
                  >
                    DONE
                  </span>
                )}
              </div>
              <div
                style={{
                  height: 3,
                  background: "#f0f0f0",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#000",
                    width: isDone || isActive ? `${s.pct}%` : "0%",
                    transition: "width 1.8s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
