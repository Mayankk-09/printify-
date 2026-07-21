"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

const links = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

const team = [
  { name: "Dhairya Gupta" },
  { name: "Mayank Khanna" },
];

export default function LandingFooter() {
  const { ref, inView } = useInView(0.1);

  return (
    <footer
      ref={ref}
      style={{
        width: "100%",
        borderTop: "1px solid #e0e0e0",
        marginTop: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 32,
          alignItems: "start",
        }}
        className="landing-footer-grid"
      >
        {/* LEFT — Logo + copyright */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <img
              src="/branding/logo-mark.png"
              alt=""
              height={22}
              width={22}
              style={{ objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#000",
              }}
            >
              PRINTIFY
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#aaa",
            }}
          >
            © 2026 PRINTIFY
          </p>
        </div>

        {/* MIDDLE — Links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
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
                width: "fit-content",
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

        {/* RIGHT — Built by */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#888",
              marginBottom: 10,
            }}
          >
            Built by
          </p>
          {team.map((t) => (
            <p
              key={t.name}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#000",
                marginBottom: 4,
              }}
            >
              {t.name}
            </p>
          ))}
          <div style={{ marginTop: 10, borderTop: "1px solid #e0e0e0", paddingTop: 10 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#888",
                marginBottom: 6,
              }}
            >
              Support
            </p>
            <a
              href="mailto:printifyquick@gmail.com"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#aaa",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#aaa";
              }}
            >
              printifyquick@gmail.com
            </a>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .landing-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </footer>
  );
}
