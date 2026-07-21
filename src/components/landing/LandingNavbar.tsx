"use client";

import { useState, useEffect } from "react";

interface LandingNavbarProps {
  onHelpClick: () => void;
}

export default function LandingNavbar({ onHelpClick }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: scrolled ? "rgba(249,249,246,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
        transition: "background 0.35s ease, backdrop-filter 0.35s ease, border-bottom 0.35s ease",
      }}
    >
      {/* LEFT — Logo + Text */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/branding/logo-mark.png"
          alt=""
          height={28}
          width={28}
          style={{ objectFit: "contain" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#000",
          }}
        >
          PRINTIFY
        </span>
      </div>

      {/* CENTER — empty */}

      {/* RIGHT — Help & Support */}
      <button
        type="button"
        onClick={onHelpClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 16px",
          background: "transparent",
          border: "1px solid rgba(0,0,0,0.12)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#000",
          cursor: "pointer",
          transition: "border-color 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#000";
          e.currentTarget.style.background = "rgba(0,0,0,0.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="17" r="0.5" fill="#000" />
        </svg>
        Help & Support
      </button>

      <style>{`
        @media (max-width: 480px) {
          nav span { display: none; }
        }
      `}</style>
    </nav>
  );
}
