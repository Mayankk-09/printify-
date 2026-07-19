export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PRINTIFY CORE",
  description:
    "Terms of service for the PRINTIFY CORE campus printing platform at printify.studio.",
};

export default function TermsPage() {
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
            Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              By accessing or using the PRINTIFY CORE platform at
              printify.studio, you agree to be bound by these Terms of Service.
              If you do not agree, do not use the service. These terms constitute
              a binding agreement between you and PRINTIFY CORE.
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
              2. Eligibility
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              This service is available exclusively to currently enrolled
              students and authorized faculty members of the campus. You must
              authenticate using your valid institutional credentials. Sharing
              your account credentials with non-eligible individuals is
              strictly prohibited.
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
              3. Permitted Use
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              You may upload documents solely for lawful academic and
              administrative printing purposes. Prohibited content includes
              but is not limited to: copyrighted material you do not have
              rights to reproduce, obscene or defamatory material, and any
              content that violates applicable Indian law. PRINTIFY CORE
              reserves the right to refuse printing of any flagged content.
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
              4. Orders &amp; Payments
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              All payments are processed through Razorpay. Prices are listed in
              Indian Rupees (INR) and include applicable taxes. Orders become
              binding once payment is confirmed. You are responsible for
              reviewing your order details before confirming payment.
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
              5. Order Pickup
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              Completed print orders must be collected from the Campus Central
              Library Floor 1 hub within 48 hours of the &quot;ready for
              pickup&quot; notification. Uncollected orders after this window
              may be recycled, and no refund will be issued for abandoned
              orders.
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
              6. Limitation of Liability
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              PRINTIFY CORE&apos;s liability is limited to the value of the
              affected print order. We are not responsible for any indirect,
              incidental, or consequential damages arising from the use or
              inability to use the service.
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
              7. Modifications
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              PRINTIFY CORE reserves the right to update these terms at any
              time. Continued use of the platform after changes constitutes
              acceptance of the revised terms. Material changes will be
              communicated via email or platform notification.
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
              8. Contact
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              For questions regarding these terms, email{" "}
              <a
                href="mailto:printify-quick@gmail.com"
                style={{
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  color: "#000",
                }}
              >
                printify-quick@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
