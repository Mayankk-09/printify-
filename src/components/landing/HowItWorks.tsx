"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

const steps = [
  {
    label: "UPLOAD",
    desc: "Drop your files",
    num: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <path d="M16 6v16M10 16l6 6 6-6" />
        <path d="M6 22v4h20v-4" />
      </svg>
    ),
  },
  {
    label: "CONFIGURE",
    desc: "Set preferences",
    num: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <circle cx="16" cy="16" r="3" />
        <path d="M16 5v5M16 22v5M5 16h5M22 16h5" />
      </svg>
    ),
  },
  {
    label: "PRINT",
    desc: "We handle it",
    num: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <rect x="6" y="12" width="20" height="12" rx="0" />
        <rect x="10" y="6" width="12" height="8" />
        <rect x="10" y="20" width="12" height="6" />
      </svg>
    ),
  },
  {
    label: "PICKUP",
    desc: "Collect prints",
    num: "04",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="1.2">
        <path d="M6 26V10l10-6 10 6v16" />
        <rect x="12" y="18" width="8" height="8" />
        <path d="M6 10l10 6 10-6" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const lineVariantsV = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HowItWorks() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "80px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 56 }}
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
          HOW PRINTIFY WORKS
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
          Four simple steps.
        </h2>
      </motion.div>

      {/* Desktop timeline */}
      <div className="landing-timeline-desktop" style={{ display: "none" }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                flex: 1,
                position: "relative",
              }}
            >
              {/* Step number */}
              <motion.span
                variants={stepVariants}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  color: "#ccc",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                {step.num}
              </motion.span>

              {/* Icon box */}
              <motion.div
                variants={stepVariants}
                whileHover={{
                  y: -3,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  borderColor: "#000",
                }}
                style={{
                  width: 64,
                  height: 64,
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  cursor: "default",
                  transition: "border-color 0.25s ease",
                }}
              >
                {step.icon}
              </motion.div>

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

              {/* Connector line */}
              {i < steps.length - 1 && (
                <motion.div
                  variants={lineVariants}
                  style={{
                    position: "absolute",
                    top: "calc(50% + 6px)",
                    left: "calc(50% + 44px)",
                    width: "calc(100% - 88px)",
                    height: 1,
                    background: "#e0e0e0",
                    transformOrigin: "left center",
                  }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile timeline */}
      <div className="landing-timeline-mobile">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.label}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 20,
                width: "100%",
                maxWidth: 320,
                position: "relative",
                paddingBottom: i < steps.length - 1 ? 32 : 0,
              }}
            >
              {/* Left column: number + vertical line */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 40,
                  flexShrink: 0,
                }}
              >
                <motion.span
                  variants={stepVariants}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    color: "#ccc",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  {step.num}
                </motion.span>
                <motion.div
                  variants={stepVariants}
                  style={{
                    width: 48,
                    height: 48,
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  {step.icon}
                </motion.div>
                {i < steps.length - 1 && (
                  <motion.div
                    variants={lineVariantsV}
                    style={{
                      width: 1,
                      flex: 1,
                      minHeight: 32,
                      background: "#e0e0e0",
                      transformOrigin: "top center",
                    }}
                  />
                )}
              </div>

              {/* Right column: label + desc */}
              <motion.div
                variants={stepVariants}
                style={{ paddingTop: 8 }}
              >
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
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .landing-timeline-desktop {
          display: none;
        }
        @media (min-width: 640px) {
          .landing-timeline-desktop { display: block !important; }
          .landing-timeline-mobile { display: none !important; }
        }
        @media (max-width: 639px) {
          .landing-timeline-desktop { display: none !important; }
          .landing-timeline-mobile { display: block !important; }
        }
      `}</style>
    </section>
  );
}
