export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PRINTIFY ",
  description:
    "Privacy policy for the PRINTIFY campus printing platform at printify.studio.",
};

export default function PrivacyPolicyPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#F9F9F6",
        display: "flex",
        justifyContent: "center",
        padding: "64px 20px",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: 640,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#888",
              textDecoration: "none",
            }}
          >
            &larr; Back to Home
          </Link>
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#888",
              marginBottom: 12,
            }}
          >
            Legal Document
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#000",
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "#888",
              marginTop: 8,
            }}
          >
            Effective Date: July 2026 &middot; Last Updated: July 19, 2026
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #000", margin: 0 }} />

        <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#000",
                marginBottom: 8,
              }}
            >
              1. Information We Collect
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              PRINTIFY CORE collects only the minimum data necessary to operate
              the campus printing service. This includes your name, university
              email address, UPI transaction references, and uploaded print
              document metadata (filename, page count, timestamp). We do not
              collect Aadhaar numbers, financial account passwords, or biometric
              data.
            </p>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#000",
                marginBottom: 8,
              }}
            >
              2. Document Data &amp; Shredding Protocol
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              All uploaded documents are held in encrypted transit storage
              solely for the purpose of fulfilling your print order. Upon
              successful pickup confirmation at the Campus Central Library
              Floor 1 hub, our{" "}
              <strong>30-Minute Post-Pickup Secure Document Data Shredding
              Protocol</strong> is initiated. Within 30 minutes of pickup
              verification, all digital copies of your document are
              permanently and irreversibly deleted from every server, cache
              layer, and backup system operated by PRINTIFY CORE. No document
              content is retained, archived, or shared with any third party
              beyond this window.
            </p>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#000",
                marginBottom: 8,
              }}
            >
              3. Payment Data
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              All payment processing is handled exclusively through Razorpay, a
              PCI-DSS Level 1 compliant gateway. PRINTIFY CORE never stores,
              processes, or has access to your UPI PIN, card CVV, or full
              account numbers. We only retain the Razorpay transaction
              reference ID and payment status for order reconciliation.
            </p>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#000",
                marginBottom: 8,
              }}
            >
              4. Data Sharing
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              We do not sell, lease, or share your personal information or
              document data with any third party. The only external processor
              involved is Razorpay for payment settlement, governed by their
              own privacy policy and compliance standards.
            </p>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#000",
                marginBottom: 8,
              }}
            >
              5. Contact
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              For privacy-related inquiries, email us at{" "}
              <a
                href="mailto:printify-quick@gmail.com"
                style={{
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  color: "#000",
                }}
              >
                printifyquick@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
