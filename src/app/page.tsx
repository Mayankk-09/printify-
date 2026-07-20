"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";

const policies = [
  {
    id: "privacy",
    title: "PRIVACY POLICY",
    body: "PRINTIFY CORE operates a strict 30-Minute Post-Pickup Secure Server Data Shredding Protocol. All uploaded files are permanently and irreversibly deleted from our servers 30 minutes after you collect your prints. No document content is retained, cached, or shared with any third party. Payment processing is handled exclusively through Razorpay, a PCI-DSS Level 1 compliant gateway. We never store or have access to your UPI PIN, card CVV, or full account numbers. Support contact: printify-quick@gmail.com.",
  },
  {
    id: "refund",
    title: "REFUND & CANCELLATION POLICY",
    body: "Active print packs cannot be canceled once applied to an order. However, a 100% refund is initiated back to your original UPI handle within 24 hours if a hardware machinery printer jam or paper error occurs on our end. Money will clear within 2–3 business days. Refunds are not applicable for successfully completed and picked-up orders, or user-uploaded files with incorrect formatting or content.",
  },
  {
    id: "terms",
    title: "TERMS & CONDITIONS",
    body: "This platform is an independent student-run venture with NO official college administrative affiliation or office footprint. You may upload documents solely for lawful academic and administrative printing purposes. Prohibited content includes copyrighted material you do not have rights to reproduce, obscene or defamatory material, and any content that violates applicable Indian law. All payments are processed through Razorpay in Indian Rupees (INR). Completed print orders must be collected within 48 hours of the ready-for-pickup notification. Uncollected orders may be recycled with no refund.",
  },
  {
    id: "contact",
    title: "CONTACT US & DELIVERY COORDINATES",
    body: "Brand Name: PRINTIFY CORE. Hub Location: Beside the Medical Room and NCC Room. Support Email: printify-quick@gmail.com. For order issues, refund requests, or general enquiries, email us at printify-quick@gmail.com. We aim to respond within 12 hours during operating hours (Mon–Sat, 08:00–22:00 IST).",
  },
];

const steps = [
  "Acknowledge the Terms & Conditions.",
  "Click the button below to navigate to the Login page",
  "Login and start using Printify",
];

export default function LandingPage() {
  const [agreed, setAgreed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#F9F9F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ── MASSIVE LOGO + BRAND HEAD ── */}
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "56px 20px 40px",
          gap: 12,
        }}
      >
        <img
          src="/branding/logo-full.png"
          alt="PRINTIFY"
          height={64}
          style={{ width: "auto", objectFit: "contain" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/branding/logo-mark.png";
          }}
        />
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#000",
            textTransform: "uppercase",
          }}
        >
          PRINTIFY
        </h1>
      </section>

      {/* ── QUICK START GUIDE ── */}
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 20px",
          border: "1px solid #000",
          background: "#fff",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#888",
          }}
        >
          HOW IT WORKS
        </p>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {steps.map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                fontSize: "0.82rem",
                lineHeight: 1.5,
                color: "#000",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  width: 20,
                  height: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #000",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── TWO-COLUMN CONSENT WORKSPACE ── */}
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "24px 20px 0",
          border: "1px solid #000",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* LEFT — SVG illustration */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            borderRight: "1px solid #000",
            background: "#fff",
            minHeight: 220,
          }}
        >
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="10" y1="100" x2="150" y2="100" stroke="#000" strokeWidth="1" />
            <rect x="35" y="50" width="90" height="40" rx="2" stroke="#000" strokeWidth="1" fill="#fff" />
            <rect x="55" y="42" width="50" height="10" rx="1" stroke="#000" strokeWidth="1" fill="#fff" />
            <rect x="62" y="28" width="36" height="18" rx="1" stroke="#000" strokeWidth="1" fill="#F9F9F6" />
            <line x1="67" y1="34" x2="93" y2="34" stroke="#000" strokeWidth="0.5" />
            <line x1="67" y1="38" x2="88" y2="38" stroke="#000" strokeWidth="0.5" />
            <line x1="67" y1="42" x2="91" y2="42" stroke="#000" strokeWidth="0.5" />
            <rect x="45" y="90" width="70" height="6" rx="1" stroke="#000" strokeWidth="1" fill="#fff" />
            <circle cx="48" cy="62" r="2" fill="#000" />
            <circle cx="55" cy="62" r="2" fill="#000" />
            <circle cx="118" cy="62" r="2.5" stroke="#000" strokeWidth="1" fill="#F9F9F6" />
            <line x1="50" y1="96" x2="50" y2="100" stroke="#000" strokeWidth="1" />
            <line x1="110" y1="96" x2="110" y2="100" stroke="#000" strokeWidth="1" />
          </svg>
        </div>

        {/* RIGHT — Consent + button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 28,
            background: "#F9F9F6",
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#888",
            }}
          >
            ACCESS PORTAL
          </p>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                marginTop: 2,
                width: 16,
                height: 16,
                accentColor: "#000",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.56rem",
                fontWeight: 700,
                lineHeight: 1.5,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#000",
              }}
            >
              I ACCEPT THE OPERATIONAL PRIVACY, REFUND, AND SERVICE TIERS SPECIFIED BELOW.
            </span>
          </label>

          {agreed ? (
            <Link
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: 52,
                padding: "14px 20px",
                background: "#000",
                color: "#F9F9F6",
                border: "1px solid #000",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                textDecoration: "none",
                transition: "opacity 0.15s ease",
              }}
            >
              Enter Platform // Login →
            </Link>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: 52,
                padding: "14px 20px",
                background: "transparent",
                border: "1px dashed #ccc",
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#aaa",
                cursor: "not-allowed",
              }}
            >
              Check Box Above to login
            </div>
          )}
        </div>
      </section>

      {/* ── ACCORDION COMPLIANCE ── */}
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "32px 20px 0",
          borderTop: "1px solid #000",
        }}
      >
        {policies.map((p, i) => {
          const isOpen = openSection === p.id;
          return (
            <div
              key={p.id}
              style={{
                borderBottom:
                  i < policies.length - 1 ? "1px solid #000" : "none",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : p.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#000",
                  }}
                >
                  {p.title}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#888",
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: "0 0 18px",
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                    color: "#333",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  {p.body}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          width: "100%",
          maxWidth: 720,
          borderTop: "1px solid #000",
          margin: "32px 20px 0",
          padding: "20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
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
          &copy; 2026 PRINTIFY
        </span>
        <a
          href="mailto:printify-quick@gmail.com"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#888",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          printify-quick@gmail.com
        </a>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </main>
  );
}
