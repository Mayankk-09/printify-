"use client";

import { useInView } from "./useInView";
import S from "./landingStyles";

const links = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Refund", href: "/refund-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function LandingFooter() {
  const { ref, inView } = useInView(0.1);

  return (
    <footer
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "32px 24px 40px",
        ...S.fadeIn(inView, 0),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          borderTop: "1px solid #e0e0e0",
          paddingTop: 24,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#888",
          }}
        >
          © 2026 PRINTIFY
        </span>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#888",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#888";
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="mailto:printify-quick@gmail.com"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#aaa",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          printify-quick@gmail.com
        </a>
      </div>
    </footer>
  );
}
