"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

const reasons = [
  {
    label: "Fast Pickup",
    desc: "Upload and collect in minutes, not hours.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    label: "Flexible Scheduling",
    desc: "Choose pickup slots that fit your timetable.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="0" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Secure Documents",
    desc: "Encrypted storage & automatic cleanup after pickup.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="0" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16.5" r="1.5" fill="#000" />
      </svg>
    ),
  },
  {
    label: "Affordable",
    desc: "Subscription packs & pay-per-page pricing.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Simple Experience",
    desc: "Minimal workflow designed for students.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    ),
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function WhyStudents() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "72px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#888",
          }}
        >
          WHY PRINTIFY
        </p>
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
          Why students choose Printify
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
        className="why-students-grid"
      >
        {reasons.map((r) => (
          <motion.div
            key={r.label}
            variants={item}
            style={{
              border: "1px solid #e0e0e0",
              background: "#fff",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              cursor: "default",
              transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease",
            }}
            whileHover={{
              y: -4,
              boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ opacity: 0.7 }}>{r.icon}</div>
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
              {r.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                lineHeight: 1.5,
                color: "#555",
              }}
            >
              {r.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .why-students-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .why-students-grid > div:last-child:nth-child(3n+2) {
          grid-column: 2 / 3;
        }
        @media (max-width: 768px) {
          .why-students-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .why-students-grid > div:last-child:nth-child(3n+2) {
            grid-column: auto;
          }
        }
        @media (max-width: 520px) {
          .why-students-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
