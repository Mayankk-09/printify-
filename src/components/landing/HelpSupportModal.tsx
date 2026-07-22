"use client";

import { useState, useCallback } from "react";

interface HelpSupportModalProps {
  open: boolean;
  onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        border: "1px solid #e0e0e0",
        background: "transparent",
        cursor: "pointer",
        flexShrink: 0,
        transition: "border-color 0.2s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#000";
        e.currentTarget.style.background = "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e0e0e0";
        e.currentTarget.style.background = "transparent";
      }}
      aria-label={`Copy ${text}`}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="0" />
          <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
        </svg>
      )}
    </button>
  );
}

const developers = [
  {
    name: "Mayank Khanna",
    github: "Mayankk-09",
    email: "mayankkhanna789@gmail.com",
    githubUrl: "https://github.com/Mayankk-09",
  },
  {
    name: "Dhairya Gupta",
    github: "stilldhairya-ui",
    email: "still.dhairya@gmail.com",
    githubUrl: "https://github.com/stilldhairya-ui",
  },
];

export default function HelpSupportModal({ open, onClose }: HelpSupportModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Help & Support"
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 0, overflow: "hidden" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
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
            Help & Support
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              border: "1px solid #e0e0e0",
              background: "transparent",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
            aria-label="Close dialog"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Developed By */}
          <div style={{ marginBottom: 14 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#888",
                marginBottom: 10,
              }}
            >
              Developed by
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#000",
                lineHeight: 1.3,
              }}
            >
              Mayank Khanna<br />&amp; Dhairya Gupta
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #e0e0e0", margin: "4px 0 20px" }} />

          {developers.map((dev, idx) => (
            <div key={dev.github} style={{ marginBottom: idx < developers.length - 1 ? 18 : 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#000",
                  marginBottom: 8,
                }}
              >
                {dev.name}
              </p>

              {/* GitHub */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <a
                    href={dev.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "#000",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {dev.github}
                  </a>
                </div>
                <CopyButton text={dev.github} />
              </div>

              {/* Email */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="0" />
                    <path d="M22 4L12 13 2 4" />
                  </svg>
                  <a
                    href={`mailto:${dev.email}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "#000",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {dev.email}
                  </a>
                </div>
                <CopyButton text={dev.email} />
              </div>

              {/* Divider between developers */}
              {idx < developers.length - 1 && (
                <div style={{ borderTop: "1px solid #e0e0e0", marginTop: 18 }} />
              )}
            </div>
          ))}

          {/* Divider */}
          <div style={{ borderTop: "1px solid #e0e0e0", margin: "4px 0 20px" }} />

          {/* Support */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#888",
                marginBottom: 10,
              }}
            >
              Support
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="0" />
                  <path d="M22 4L12 13 2 4" />
                </svg>
                <a
                  href="mailto:printifyquick@gmail.com"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "#000",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  printifyquick@gmail.com
                </a>
              </div>
              <CopyButton text="printifyquick@gmail.com" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #e0e0e0",
            background: "#fafafa",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#aaa",
              textAlign: "center",
            }}
          >
            Built with ❤️ for students.
          </p>
        </div>
      </div>
    </div>
  );
}
