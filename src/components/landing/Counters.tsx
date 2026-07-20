"use client";

import { useInView } from "./useInView";
import S from "./landingStyles";

const capabilities = [
  {
    label: "PDF / DOC / DOCX / PPT / PPTX",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="4" y="2" width="14" height="18" rx="1" />
        <path d="M8 7h6M8 10h6M8 13h4" />
      </svg>
    ),
  },
  {
    label: "Secure Storage",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="5" y="10" width="12" height="9" rx="1" />
        <path d="M7 10V7a4 4 0 0 1 8 0v3" />
        <circle cx="11" cy="14.5" r="1" fill="#000" />
      </svg>
    ),
  },
  {
    label: "Flexible Pickup",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="3" y="4" width="16" height="14" rx="1" />
        <path d="M3 9h16M8 2v4M14 2v4" />
        <circle cx="11" cy="14" r="1.5" />
      </svg>
    ),
  },
  {
    label: "Premium Printing",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="3" y="8" width="16" height="8" rx="1" />
        <rect x="6" y="4" width="10" height="6" />
        <rect x="6" y="14" width="10" height="4" />
      </svg>
    ),
  },
];

export default function ProductCapabilities() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        padding: "40px 24px",
        borderTop: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        ...S.fadeInUp(inView, 0),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {capabilities.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              border: "1px solid #e0e0e0",
              background: "#fff",
            }}
          >
            <div style={{ opacity: 0.7, flexShrink: 0 }}>{c.icon}</div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
