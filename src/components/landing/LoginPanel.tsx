"use client";

import { useState } from "react";
import Link from "next/link";
import { useInView } from "./useInView";
import S from "./landingStyles";

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

const trustBadges = [
  { label: "SSL Protected", icon: "🔒" },
  { label: "Secure Authentication", icon: "🛡️" },
  { label: "Encrypted Storage", icon: "🔐" },
  { label: "Student Friendly", icon: "🎓" },
];

export default function LoginPanel() {
  const [agreed, setAgreed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { ref, inView } = useInView(0.06);

  return (
    <section
      id="access-portal"
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        padding: "32px 24px 48px",
        scrollMarginTop: 24,
      }}
    >
      {/* Login panel card */}
      <div
        style={{
          border: "1px solid #000",
          background: "#fff",
          padding: "24px 28px",
          ...S.fadeInUp(inView, 0),
        }}
      >
        <p style={{ ...S.eyebrow(), marginBottom: 16 }}>ACCESS PORTAL</p>

        {/* Trust badges */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {trustBadges.map((b) => (
            <div
              key={b.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 8px",
                border: "1px solid #e0e0e0",
                fontFamily: "var(--font-mono)",
                fontSize: "0.52rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#555",
              }}
            >
              <span style={{ fontSize: "0.7rem" }}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            cursor: "pointer",
            marginBottom: 16,
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
            aria-label="I accept the operational privacy, refund, and service tiers"
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
            I ACCEPT THE OPERATIONAL PRIVACY, REFUND, AND SERVICE TIERS
            SPECIFIED BELOW.
          </span>
        </label>

        {/* Login button / disabled state */}
        {agreed ? (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 48,
              padding: "12px 20px",
              background: "#000",
              color: "#F9F9F6",
              border: "1px solid #000",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textDecoration: "none",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Continue to Login →
          </Link>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 48,
              padding: "12px 20px",
              background: "transparent",
              border: "1px dashed #ccc",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#aaa",
              cursor: "not-allowed",
            }}
          >
            Check the box above to continue
          </div>
        )}
      </div>

      {/* Accordion compliance — tighter spacing */}
      <div
        style={{
          borderTop: "1px solid #000",
          marginTop: 0,
          ...S.fadeInUp(inView, 0.1),
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
                  padding: "14px 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                aria-expanded={isOpen}
                aria-controls={`policy-${p.id}`}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
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
                    transition: "transform 0.3s ease",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              <div
                id={`policy-${p.id}`}
                role="region"
                aria-labelledby={`label-${p.id}`}
                style={{
                  maxHeight: isOpen ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease, opacity 0.3s ease",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p
                  style={{
                    paddingBottom: 14,
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                    color: "#333",
                  }}
                >
                  {p.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
