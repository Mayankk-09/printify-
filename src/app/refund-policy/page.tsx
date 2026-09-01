export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — PRINTIFY ",
  description:
    "Refund policy for the PRINTIFY  campus printing platform at printify.studio.",
};

export default function RefundPolicyPage() {
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
            Refund Policy
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
              1. Eligibility for Refund
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              A <strong>100% full refund</strong> is applicable if your print
              job could not be completed due to a hardware machine printer
              jam, mechanical failure, or any equipment malfunction on our
              end. If the printing hardware fails to produce your order, you
              are entitled to a complete money reversal — no deductions, no
              restocking fees.
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
              2. Refund Method &amp; Timeline
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              All refunds are processed exclusively back to the{" "}
              <strong>original UPI handle</strong> used during the transaction.
              Upon confirmation of the hardware failure by our operations team,
              the refund is initiated within 24 hours and credited to your UPI
              account within <strong>2–3 banking days</strong>. You will receive
              an email confirmation at your registered address once the refund
              is processed.
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
              3. How to Request a Refund
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              Report the printer jam or failure immediately at the Campus
              Central Library Floor 1 hub or email{" "}
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
              </a>{" "}
              with your order ID. Our team will verify the hardware issue and
              process the refund to your original UPI handle.
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
              4. Non-Refundable Cases
            </h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
              Refunds are not applicable for successfully completed and picked-up
              print orders, user-uploaded files with incorrect formatting or
              content, or orders cancelled after printing has commenced without
              a hardware failure.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
