"use client";

import { useEffect, useState } from "react";
import PrinterAnimation from "./PrinterAnimation";
import S from "./landingStyles";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollToPortal = () => {
    const el = document.getElementById("access-portal");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 48px",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Paper texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundRepeat: "repeat",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <div style={{ maxWidth: 720, width: "100%", textAlign: "center" }}>
        {/* Logo */}
        <div style={S.fadeInUp(loaded, 0)}>
          <img
            src="/branding/logo-full.png"
            alt="Printify"
            height={56}
            style={{
              width: "auto",
              objectFit: "contain",
              marginBottom: 16,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/branding/logo-mark.png";
            }}
          />
        </div>

        {/* PRINTIFY */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3rem, 10vw, 5.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            color: "#000",
            textTransform: "uppercase",
            marginBottom: 24,
            ...S.fadeInUp(loaded, 0.1),
          }}
        >
          PRINTIFY
        </h1>

        {/* Tagline */}
        <div style={{ marginBottom: 20, ...S.fadeInUp(loaded, 0.25) }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.2,
              color: "#000",
              letterSpacing: "-0.02em",
            }}
          >
            Print Less.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.2,
              color: "#000",
              letterSpacing: "-0.02em",
            }}
          >
            Achieve More.
          </p>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            lineHeight: 1.7,
            color: "#555",
            maxWidth: 520,
            margin: "0 auto 36px",
            ...S.fadeInUp(loaded, 0.4),
          }}
        >
          Professional document printing for students. Upload documents,
          configure prints, choose pickup slots and collect your order with
          ease.
        </p>

        {/* CTA Button — scrolls to Access Portal */}
        <div style={S.fadeInUp(loaded, 0.55)}>
          <button
            type="button"
            onClick={scrollToPortal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 220,
              padding: "16px 40px",
              background: "#000",
              color: "#F9F9F6",
              border: "1px solid #000",
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            aria-label="Get started - scroll to access portal"
          >
            GET STARTED
          </button>
        </div>

        {/* Animated down-arrow indicator */}
        <div
          style={{
            marginTop: 20,
            ...S.fadeIn(loaded, 0.75),
          }}
          aria-hidden="true"
        >
          <svg
            width="20"
            height="28"
            viewBox="0 0 20 28"
            fill="none"
            style={{
              animation: "heroArrowBounce 2s ease-in-out infinite",
            }}
          >
            <rect x="8" y="0" width="4" height="4" fill="#000" opacity="0.25" />
            <path
              d="M10 6 L10 22"
              stroke="#000"
              strokeWidth="1.2"
              opacity="0.25"
            />
            <path
              d="M5 18 L10 24 L15 18"
              stroke="#000"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />
          </svg>
        </div>
      </div>

      {/* Printer Illustration */}
      <div
        style={{
          marginTop: 40,
          ...S.fadeInUp(loaded, 0.65),
        }}
      >
        <PrinterAnimation />
      </div>

      {/* Hero Stats */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 40,
          flexWrap: "wrap",
          justifyContent: "center",
          ...S.fadeIn(loaded, 0.8),
        }}
      >
        {[
          { icon: "⚡", text: "30 Seconds Upload" },
          { icon: "📄", text: "PDF DOC DOCX PPT PPTX" },
          { icon: "🎓", text: "Student Friendly" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              border: "1px solid #e0e0e0",
              background: "#fff",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{stat.icon}</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#333",
              }}
            >
              {stat.text}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes heroArrowBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
