"use client";

const S = {
  section: (extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
    padding: "0 24px",
    ...extra,
  }),
  eyebrow: (extra?: React.CSSProperties): React.CSSProperties => ({
    fontFamily: "var(--font-mono)",
    fontSize: "0.62rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
    color: "#888",
    ...extra,
  }),
  fadeInUp: (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  }),
  fadeIn: (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transition: `opacity 0.6s ease ${delay}s`,
  }),
  noSelect: { userSelect: "none" as const },
};

export default S;
