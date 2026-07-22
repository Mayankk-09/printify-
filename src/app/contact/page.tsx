export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — PRINTIFY CORE",
  description:
    "Contact information for the PRINTIFY CORE campus printing platform at printify.studio.",
};

export default function ContactPage() {
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
            Get in Touch
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
            Contact Us
          </h1>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #000", margin: 0 }} />

        <div
          style={{
            border: "1px solid #000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {[
            {
              label: "Brand",
              value: "PRINTIFY CORE",
            },
            {
              label: "Hub Location",
              value: "Campus Central Library Floor 1",
            },
            {
              label: "Email",
              value: "printify-quick@gmail.com",
              href: "mailto:printify-quick@gmail.com",
            },
            {
              label: "Platform",
              value: "printify.studio",
              href: "https://printify.studio",
            },
            {
              label: "Hours",
              value: "Library Operating Hours (Mon–Sat, 08:00–22:00 IST)",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "18px 20px",
                borderBottom:
                  i < 4 ? "1px solid #000" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#888",
                }}
              >
                {item.label}
              </span>
              {item.href ? (
                <a
                  href={item.href}
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#000",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  {item.value}
                </a>
              ) : (
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#000",
            }}
          >
            Support
          </h2>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }}>
            For order issues, refund requests, or general enquiries, email us
            at{" "}
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
            . We aim to respond within 12 hours during operating hours on working days.
          </p>
        </section>
      </article>
    </main>
  );
}
