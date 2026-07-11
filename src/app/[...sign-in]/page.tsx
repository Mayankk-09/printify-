"use client";

import { useState, useRef, useCallback } from "react";
import StableInput from "@/components/StableInput";

type AuthStep = "email" | "otp";

export default function SignInPage() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendCode = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!name || name.trim().length < 2) {
      setError("Enter your full name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (res.status === 200) {
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

  const handleVerify = useCallback(async (e?: React.MouseEvent | React.FormEvent) => {
    console.log(">>> [VERIFY] Submission triggered. Compiling OTP digits array:", pin);
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const code = pin.join("").trim();
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, name: name.trim() }),
      });
      console.log(">>> [VERIFY] Network response status code received:", res.status);
      console.log(">>> [VERIFY] Network response ok state:", res.ok);
      if (res.status === 200 || res.ok) {
        console.log(">>> [VERIFY] Success detected. Attempting hard window redirection to /dashboard...");
        window.location.href = "/dashboard";
        return;
      } else {
        setError("Invalid security pin code.");
      }
    } catch (err) {
      console.error(">>> [VERIFY CRITICAL ERROR TRACE]:", err);
      setError(err instanceof Error ? err.message : "Invisible runtime interception triggered.");
    } finally {
      setLoading(false);
    }
  }, [pin, email, name]);

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => {
      setStep("email");
      setAnimating(false);
      setPin(["", "", "", "", "", ""]);
      setError("");
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
                {loading ? "SENDING\u2026" : "DISPATCH ACCESS CODE"}
              </button>
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
                  : "VERIFY ACCESS TOKEN"}
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
            PRINT SMART &mdash; NOT HARD
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
        // PRNTFY SECURED IDENTITY GATEWAY //
      </div>
    </div>
  );
}
