"use client";

import { useInView } from "./useInView";
import S from "./landingStyles";

const steps = [
  {
    label: "UPLOAD",
    desc: "Drop your files",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <path d="M16 6v16M10 16l6 6 6-6" />
        <path d="M6 22v4h20v-4" />
      </svg>
    ),
  },
  {
    label: "CONFIGURE",
    desc: "Set preferences",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <circle cx="16" cy="16" r="3" />
        <path d="M16 5v5M16 22v5M5 16h5M22 16h5" />
      </svg>
    ),
  },
  {
    label: "PRINT",
    desc: "We handle it",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="6" y="12" width="20" height="12" rx="1" />
        <rect x="10" y="6" width="12" height="8" />
        <rect x="10" y="20" width="12" height="6" />
      </svg>
    ),
  },
  {
    label: "PICKUP",
    desc: "Collect prints",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <path d="M6 26V10l10-6 10 6v16" />
        <rect x="12" y="18" width="8" height="8" />
        <path d="M6 10l10 6 10-6" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "64px 24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48, ...S.fadeInUp(inView, 0) }}>
        <p style={S.eyebrow()}>HOW PRINTIFY WORKS</p>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginTop: 8,
            color: "#000",
          }}
        >
          Four simple steps.
        </h2>
      </div>

      {/* Timeline */}
      <div className="landing-timeline">
        {steps.map((step, i) => (
          <div
            key={step.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              position: "relative",
              ...S.fadeInUp(inView, 0.15 + i * 0.12),
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 64,
                height: 64,
                border: "1px solid #000",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              {step.icon}
            </div>

            {/* Label */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#000",
                  marginBottom: 4,
                }}
              >
                {step.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "#888",
                }}
              >
                {step.desc}
              </p>
            </div>

            {/* Connector line (not on last) */}
            {i < steps.length - 1 && (
              <div className="landing-timeline-connector" />
            )}
          </div>
        ))}
      </div>

      <style>{`
        .landing-timeline {
          display: flex;
          justify-content: center;
          gap: 24px;
          position: relative;
        }
        .landing-timeline-connector {
          display: none;
        }
        @media (min-width: 640px) {
          .landing-timeline {
            flex-direction: row;
            align-items: flex-start;
          }
          .landing-timeline > div {
            flex: 1;
            position: relative;
          }
          .landing-timeline-connector {
            display: block !important;
            position: absolute;
            top: 32px;
            left: calc(50% + 40px);
            width: calc(100% - 80px);
            height: 1px;
            background: #e0e0e0;
          }
        }
        @media (max-width: 639px) {
          .landing-timeline {
            flex-direction: column;
            align-items: center;
          }
          .landing-timeline > div {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </section>
  );
}
