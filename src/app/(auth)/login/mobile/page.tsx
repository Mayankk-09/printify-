"use client";

import React, { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import StableInput from "@/components/StableInput";

type AuthState = "phone" | "otp";

export default function MobileLoginPage() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = useCallback(async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send code");
        setLoading(false);
        return;
      }
      setAnimating(true);
      setTimeout(() => {
        setState("otp");
        setAnimating(false);
        inputRefs.current[0]?.focus();
      }, 320);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [phone]);

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

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && !pin[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    const code = pin.join("");
    if (code.length !== 6) {
      toast.error("Enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid code");
        setLoading(false);
        return;
      }
      toast.success("Authenticated");
      setLoading(false);
      setTimeout(() => { router.push("/dashboard"); }, 100);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [phone, pin, router]);

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => {
      setState("phone");
      setAnimating(false);
    }, 320);
  };

  return (
    <div
      style={{
        width: "100vw !important",
        maxWidth: "100% !important",
        minHeight: "100dvh !important",
        display: "flex !important",
        flexDirection: "column !important",
        alignItems: "center !important",
        justifyContent: "center !important",
        overflowX: "hidden !important",
        margin: "0 !important",
        padding: "16px",
        boxSizing: "border-box",
      } as any}
    >
      <div
        style={{
          width: "100% !important",
          maxWidth: "380px !important",
          display: "flex !important",
          flexDirection: "column !important",
          boxSizing: "border-box !important",
          fontFamily: "'Space Mono', 'Courier New', monospace",
        } as any}
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
            MOBILE GATE
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
          <div
            style={{
              opacity: state === "phone" && !animating ? 1 : 0,
              transform: state === "phone" && !animating ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              pointerEvents: state === "phone" && !animating ? "auto" : "none",
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
              PHONE NUMBER
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                border: "1px solid #000",
                background: "#fff",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  flexShrink: 0,
                }}
              >
                +91
              </span>
              <span style={{ width: "1px", background: "#000", flexShrink: 0 }} />
              <StableInput
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChangeAction={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDownAction={(e) => e.key === "Enter" && handleSendOtp()}
                disabled={loading}
                autoFocus
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#000",
                  padding: "14px 12px",
                  outline: "none",
                  letterSpacing: "0.08em",
                  minWidth: 0,
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
              A 6-digit code will be sent via SMS to this number.
            </p>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                width: "100%",
                border: "1px solid #000",
                background: "#000",
                color: "#fff",
                fontFamily: "'Space Mono', 'Courier New', monospace",
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

          <div
            style={{
              opacity: state === "otp" && !animating ? 1 : 0,
              transform: state === "otp" && !animating ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              pointerEvents: state === "otp" && !animating ? "auto" : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: state === "otp" && !animating ? "relative" : "absolute",
              inset: state === "otp" && !animating ? "auto" : 0,
              padding: state === "otp" && !animating ? 0 : "32px 20px 40px",
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
              &larr; EDIT PHONE
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
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeAction={(e) => handlePinChange(i, e.target.value)}
                  onKeyDownAction={(e) => handlePinKeyDown(i, e)}
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
                    transition: "background 0.12s, color 0.12s",
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
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{
                width: "100%",
                border: "1px solid #000",
                background: "#000",
                color: "#fff",
                fontFamily: "'Space Mono', 'Courier New', monospace",
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
              {loading ? "VERIFYING\u2026" : "VERIFY ACCESS TOKEN"}
            </button>
          </div>
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
    </div>
  );
}
