"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef, useCallback } from "react";
import StableInput from "@/components/StableInput";

type AuthStep = "email" | "otp";

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const APPLE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#000">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const FACEBOOK_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const SOCIAL_STRATEGIES: {
  label: string;
  icon: React.ReactNode;
  strategy: string;
}[] = [
  { label: "AUTHENTICATE // VIA GOOGLE CORE", icon: GOOGLE_ICON, strategy: "google" },
  { label: "AUTHENTICATE // VIA APPLE REVENUE", icon: APPLE_ICON, strategy: "apple" },
  { label: "AUTHENTICATE // VIA META EDGE", icon: FACEBOOK_ICON, strategy: "facebook" },
];

export default function LoginClient() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState("");
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOAuth = useCallback(
    async (_strategy: string) => {
      setError("Social authentication is currently unavailable. Please use email instead.");
    },
    [],
  );

  const handleSendCode = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim() }),
      });
      if (res.status === 200) {
        setIsSignUpFlow(true);
        setAnimating(true);
        setTimeout(() => {
          setStep("otp");
          setAnimating(false);
          inputRefs.current[0]?.focus();
        }, 320);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Failed to send verification code");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, name]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && index > 0 && !pin[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const combinedOtp = pin.join("").replace(/\s/g, "");
    if (combinedOtp.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: combinedOtp, name: name.trim() }),
      });
      if (res.status === 200 || res.ok) {
        router.push("/");
        return;
      } else {
        const data = await res.json();
        setError(data.error || "Invalid verification code");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pin, email, name, router]);

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => {
      setStep("email");
      setAnimating(false);
      setPin(["", "", "", "", "", ""]);
      setError("");
      setIsSignUpFlow(false);
    }, 320);
  };

  return (
    <div
      style={{
        width: "100vw",
        maxWidth: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflowX: "hidden",
        margin: 0,
        padding: "16px",
        boxSizing: "border-box",
        background: "#F9F9F6",
      }}
    >


      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          fontFamily: "'Space Mono', 'Courier New', monospace",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #000",
            padding: "14px 20px",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.1rem",
              fontWeight: 900,
              letterSpacing: "0.06em",
              color: "#000",
            }}
          >
            PRINTIFY
          </span>
          <span
            style={{
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#000",
            }}
          >
            SECURE GATE
          </span>
        </nav>

        <main
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "32px 20px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {step === "email" && (
            <div
              style={{
                opacity: animating ? 0 : 1,
                transform: animating
                  ? "translateY(8px)"
                  : "translateY(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 0.92,
                  color: "#000",
                  marginBottom: "28px",
                }}
              >
                AUTHENTICATION
              </h1>

              {error && (
                <p
                  style={{
                    fontSize: "0.55rem",
                    color: "#cc0000",
                    marginBottom: "12px",
                    letterSpacing: "0.02em",
                    fontWeight: 700,
                  }}
                >
                  {error}
                </p>
              )}

              <label
                style={{
                  display: "block",
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "#000",
                  marginBottom: "10px",
                }}
              >
                FULL NAME
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  border: "1px solid #000",
                  background: "#fff",
                  marginBottom: "16px",
                }}
              >
                <StableInput
                  type="text"
                  inputMode="text"
                  placeholder="Enter full name"
                  value={name}
                  onChangeAction={(e) => setName(e.target.value)}
                  onKeyDownAction={(e) =>
                    e.key === "Enter" && handleSendCode()
                  }
                  disabled={loading}
                  autoFocus
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#000",
                    padding: "14px 12px",
                    outline: "none",
                    letterSpacing: "0.02em",
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <label
                style={{
                  display: "block",
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "#000",
                  marginBottom: "10px",
                }}
              >
                EMAIL ADDRESS
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  border: "1px solid #000",
                  background: "#fff",
                }}
              >
                <StableInput
                  type="email"
                  inputMode="email"
                  placeholder="name@college.edu"
                  value={email}
                  onChangeAction={(e) => setEmail(e.target.value)}
                  onKeyDownAction={(e) =>
                    e.key === "Enter" && handleSendCode()
                  }
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#000",
                    padding: "14px 12px",
                    outline: "none",
                    letterSpacing: "0.02em",
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "0.55rem",
                  color: "#888",
                  margin: "10px 0 0",
                  letterSpacing: "0.02em",
                }}
              >
                A 6-digit code will be sent to this email.
              </p>

              <button
                onClick={handleSendCode}
                disabled={loading}
                style={{
                  width: "100%",
                  border: "1px solid #000",
                  background: "#000",
                  color: "#fff",
                  fontFamily:
                    "'Space Mono', 'Courier New', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  padding: "16px 20px",
                  marginTop: "24px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.4 : 1,
                  transition: "transform 0.1s ease, opacity 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {loading ? "SENDING\u2026" : "REQUEST ACCESS TOKEN"}
              </button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginTop: "24px",
                  borderTop: "1px solid #000",
                  paddingTop: "24px",
                }}
              >
                {SOCIAL_STRATEGIES.map((s) => (
                  <button
                    key={s.strategy}
                    onClick={() => handleOAuth(s.strategy)}
                    type="button"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      border: "1px solid #000",
                      background: "#fff",
                      color: "#000",
                      fontFamily:
                        "'Space Mono', 'Courier New', monospace",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition:
                        "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#000";
                      e.currentTarget.style.color = "#fff";
                      const svg = e.currentTarget.querySelector("svg");
                      if (svg) {
                        const paths = svg.querySelectorAll("path, circle");
                        paths.forEach((p) => {
                          const fill = p.getAttribute("fill") || "";
                          if (fill !== "none" && fill !== "transparent") {
                            p.setAttribute("data-original-fill", fill);
                            p.setAttribute("fill", "#fff");
                          }
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#000";
                      const svg = e.currentTarget.querySelector("svg");
                      if (svg) {
                        const paths = svg.querySelectorAll("path, circle");
                        paths.forEach((p) => {
                          const orig = p.getAttribute("data-original-fill");
                          if (orig) {
                            p.setAttribute("fill", orig);
                          }
                        });
                      }
                    }}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "otp" && (
            <div
              style={{
                opacity: animating ? 0 : 1,
                transform: animating
                  ? "translateY(8px)"
                  : "translateY(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleBack}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  marginBottom: "20px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "#000",
                  cursor: "pointer",
                  display: "inline-block",
                  textAlign: "left",
                }}
              >
                &larr; EDIT EMAIL
              </button>

              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 0.92,
                  color: "#000",
                  marginBottom: "28px",
                }}
              >
                VERIFICATION
              </h1>

              {error && (
                <p
                  style={{
                    fontSize: "0.55rem",
                    color: "#cc0000",
                    marginBottom: "12px",
                    letterSpacing: "0.02em",
                    fontWeight: 700,
                  }}
                >
                  {error}
                </p>
              )}

              <label
                style={{
                  display: "block",
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "#000",
                  marginBottom: "10px",
                }}
              >
                ENTER 6-DIGIT VERIFICATION PIN
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                {pin.map((digit, i) => (
                  <StableInput
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeAction={(e) =>
                      handlePinChange(i, e.target.value)
                    }
                    onKeyDownAction={(e) =>
                      handlePinKeyDown(i, e)
                    }
                    disabled={loading}
                    autoFocus={i === 0}
                    style={{
                      width: "14%",
                      height: "48px",
                      textAlign: "center",
                      border: "1px solid #000",
                      boxSizing: "border-box",
                      borderRadius: 0,
                      fontSize: "18px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "#000",
                      background: "#fff",
                      outline: "none",
                      transition:
                        "background 0.12s, color 0.12s",
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.background = "#000";
                      e.target.style.color = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.background = "#fff";
                      e.target.style.color = "#000";
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                style={{
                  width: "100%",
                  border: "1px solid #000",
                  background: "#000",
                  color: "#fff",
                  fontFamily:
                    "'Space Mono', 'Courier New', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  padding: "16px 20px",
                  marginTop: "24px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.4 : 1,
                  transition: "transform 0.1s ease, opacity 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {loading
                  ? "VERIFYING\u2026"
                  : "SUBMIT VERIFICATION KEY"}
              </button>
            </div>
          )}
        </main>

        <footer
          style={{
            borderTop: "1px solid #000",
            padding: "14px 20px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.5rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#000",
            }}
          >
            NEED PRINT? WE GOT IT.
          </span>
        </footer>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          padding: "8px 16px",
          paddingBottom:
            "calc(8px + env(safe-area-inset-bottom))",
          background: "#F9F9F6",
          borderTop: "1px solid #000",
          fontSize: "10px",
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#888",
        }}
      >
        // PRNTIFY SECURED IDENTITY GATEWAY //
      </div>
    </div>
  );
}
