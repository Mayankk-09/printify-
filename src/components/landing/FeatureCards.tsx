"use client";

import { useInView } from "./useInView";
import S from "./landingStyles";

const features = [
  {
    label: "Upload",
    desc: "PDF, DOC, DOCX, PPT, PPTX.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.2">
        <path d="M14 4v16M8 14l6 6 6-6" />
        <path d="M4 20v4h20v-4" />
      </svg>
    ),
  },
  {
    label: "Configure",
    desc: "Black & White, Color, Add-ons.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.2">
        <circle cx="14" cy="14" r="3" />
        <path d="M14 4v4M14 20v4M4 14h4M20 14h4M7.5 7.5l2.8 2.8M17.7 17.7l2.8 2.8M7.5 20.5l2.8-2.8M17.7 10.3l2.8-2.8" />
      </svg>
    ),
  },
  {
    label: "Pickup",
    desc: "Flexible pickup scheduling.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="4" y="6" width="20" height="18" rx="1" />
        <path d="M4 12h20M10 4v4M18 4v4" />
        <circle cx="14" cy="18" r="2" />
      </svg>
    ),
  },
  {
    label: "Secure",
    desc: "Encrypted storage. Auto cleanup.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="6" y="12" width="16" height="12" rx="1" />
        <path d="M9 12V8a5 5 0 0 1 10 0v4" />
        <circle cx="14" cy="18" r="1.5" fill="#000" />
      </svg>
    ),
  },
];

export default function FeatureCards() {
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
      <div style={{ textAlign: "center", marginBottom: 40, ...S.fadeInUp(inView, 0) }}>
        <p style={S.eyebrow()}>FEATURES</p>
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
          Everything you need.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
        className="landing-features-grid"
      >
        {features.map((f, i) => (
          <div
            key={f.label}
            style={{
              border: "1px solid #e0e0e0",
              background: "#fff",
              padding: "28px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              cursor: "default",
              transition: "transform 0.2s ease, box-shadow 0.25s ease",
              ...S.fadeInUp(inView, 0.1 + i * 0.08),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ opacity: 0.85 }}>{f.icon}</div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#000",
              }}
            >
              {f.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                lineHeight: 1.5,
                color: "#555",
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .landing-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .landing-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
