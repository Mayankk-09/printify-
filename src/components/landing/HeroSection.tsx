"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import PrinterAnimation from "./PrinterAnimation";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [ctaPressed, setCtaPressed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollToPortal = useCallback(() => {
    const el = document.getElementById("access-portal");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "120px 24px 48px",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Decorative elements layer — below 4% opacity */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {/* Faint dotted grid */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.025,
          }}
        >
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill="#000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Floating paper outlines */}
        {[
          { x: "8%", y: "12%", w: 52, h: 68, rot: -6, dur: 22 },
          { x: "85%", y: "18%", w: 44, h: 58, rot: 4, dur: 26 },
          { x: "12%", y: "72%", w: 40, h: 52, rot: -3, dur: 24 },
          { x: "88%", y: "65%", w: 48, h: 64, rot: 7, dur: 28 },
          { x: "50%", y: "8%", w: 36, h: 48, rot: -2, dur: 20 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              opacity: 0.03,
              transform: `rotate(${p.rot}deg)`,
              animation: `heroDecoFloat${i % 3} ${p.dur}s ease-in-out infinite`,
            }}
          >
            <svg viewBox="0 0 50 66" fill="none" width="100%" height="100%">
              <rect x="0.5" y="0.5" width="49" height="65" fill="none" stroke="#000" strokeWidth="0.6" />
              {/* Corner fold */}
              <path d="M38 0.5 L49.5 0.5 L49.5 12" fill="none" stroke="#000" strokeWidth="0.5" />
              <line x1="38" y1="0.5" x2="49.5" y2="12" stroke="#000" strokeWidth="0.5" />
              {/* Text lines */}
              <line x1="8" y1="18" x2="36" y2="18" stroke="#000" strokeWidth="0.4" />
              <line x1="8" y1="24" x2="32" y2="24" stroke="#000" strokeWidth="0.4" />
              <line x1="8" y1="30" x2="34" y2="30" stroke="#000" strokeWidth="0.4" />
              <line x1="8" y1="36" x2="28" y2="36" stroke="#000" strokeWidth="0.4" />
            </svg>
          </div>
        ))}

        {/* Tiny printer watermark */}
        <svg
          style={{
            position: "absolute",
            right: "10%",
            top: "30%",
            width: 120,
            height: 90,
            opacity: 0.02,
          }}
          viewBox="0 0 120 90"
          fill="none"
          stroke="#000"
          strokeWidth="0.8"
        >
          <rect x="20" y="30" width="80" height="35" />
          <rect x="30" y="22" width="60" height="12" />
          <rect x="35" y="60" width="50" height="10" />
          <line x1="38" y1="38" x2="82" y2="38" strokeWidth="0.4" />
          <line x1="38" y1="44" x2="76" y2="44" strokeWidth="0.4" />
        </svg>

        {/* Paper stack outlines */}
        <svg
          style={{
            position: "absolute",
            left: "6%",
            top: "40%",
            width: 80,
            height: 100,
            opacity: 0.02,
          }}
          viewBox="0 0 60 78"
          fill="none"
          stroke="#000"
          strokeWidth="0.5"
        >
          <rect x="8" y="8" width="44" height="58" fill="none" />
          <rect x="4" y="4" width="44" height="58" fill="none" />
          <rect x="0" y="0" width="44" height="58" fill="none" />
        </svg>
      </div>

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

      <motion.div
        variants={container}
        initial="hidden"
        animate={loaded ? "visible" : "hidden"}
        style={{ maxWidth: 720, width: "100%", textAlign: "center" }}
      >
        {/* Logo — fades in small since navbar has it */}
        <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
          <img
            src="/branding/logo-full.png"
            alt="Printify"
            height={44}
            style={{
              width: "auto",
              objectFit: "contain",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </motion.div>

        {/* PRINTIFY */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3rem, 10vw, 5.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            color: "#000",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          PRINTIFY
        </motion.h1>

        {/* Tagline */}
        <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
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
        </motion.div>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            lineHeight: 1.7,
            color: "#555",
            maxWidth: 520,
            margin: "0 auto 36px",
          }}
        >
          Professional document printing for students. Upload documents,
          configure prints, choose pickup slots and collect your order with
          ease.
        </motion.p>

        {/* CTA Button — improved hover/click */}
        <motion.div variants={fadeUp}>
          <motion.button
            type="button"
            onClick={scrollToPortal}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => { setCtaHovered(false); setCtaPressed(false); }}
            onMouseDown={() => setCtaPressed(true)}
            onMouseUp={() => setCtaPressed(false)}
            animate={{
              y: ctaPressed ? 0 : ctaHovered ? -3 : 0,
              boxShadow: ctaHovered
                ? "0 8px 30px rgba(0,0,0,0.18)"
                : "0 0px 0px rgba(0,0,0,0)",
              scale: ctaPressed ? 0.98 : 1,
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
            }}
            aria-label="Get started - scroll to access portal"
          >
            {/* Shine sweep on hover */}
            <motion.div
              animate={{
                x: ctaHovered ? "200%" : "-100%",
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "60%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                pointerEvents: "none",
              }}
            />
            GET STARTED
          </motion.button>
        </motion.div>

        {/* Animated down-arrow */}
        <motion.div
          variants={fadeUp}
          style={{ marginTop: 20 }}
          aria-hidden="true"
        >
          <svg
            width="20"
            height="28"
            viewBox="0 0 20 28"
            fill="none"
            style={{
              animation: "heroArrowBounce 2.5s ease-in-out infinite",
            }}
          >
            <rect x="8" y="0" width="4" height="4" fill="#000" opacity="0.2" />
            <path d="M10 6 L10 22" stroke="#000" strokeWidth="1.2" opacity="0.2" />
            <path d="M5 18 L10 24 L15 18" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Printer Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={loaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginTop: 40 }}
      >
        <PrinterAnimation />
      </motion.div>

      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.9 }}
        style={{
          display: "flex",
          gap: 32,
          marginTop: 40,
          flexWrap: "wrap",
          justifyContent: "center",
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
      </motion.div>

      <style>{`
        @keyframes heroArrowBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.4; }
        }
        @keyframes heroDecoFloat0 {
          0%, 100% { transform: rotate(-6deg) translate(0, 0); }
          33% { transform: rotate(-4deg) translate(3px, -5px); }
          66% { transform: rotate(-7deg) translate(-2px, 3px); }
        }
        @keyframes heroDecoFloat1 {
          0%, 100% { transform: rotate(4deg) translate(0, 0); }
          33% { transform: rotate(6deg) translate(-4px, 4px); }
          66% { transform: rotate(2deg) translate(3px, -3px); }
        }
        @keyframes heroDecoFloat2 {
          0%, 100% { transform: rotate(-3deg) translate(0, 0); }
          33% { transform: rotate(-1deg) translate(2px, -6px); }
          66% { transform: rotate(-5deg) translate(-3px, 2px); }
        }
      `}</style>
    </section>
  );
}
