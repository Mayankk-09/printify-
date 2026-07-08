"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import StableInput from "@/components/StableInput";

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setAnimating(true);
      setTimeout(() => {
        setStep("otp");
        setAnimating(false);
        inputRefs.current[0]?.focus();
      }, 320);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = pin.join("");
    if (code.length !== 6) {
      toast.error("Enter all 6 digits");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) throw new Error("Auto-login failed");

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => {
      setStep("form");
      setAnimating(false);
      setSubmitting(false);
    }, 320);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100vw",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflowX: "hidden",
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
        }}
      >
        <div
          style={{
            border: "1px solid #000",
            background: "#fff",
            padding: "28px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "20px",
              color: "#000",
            }}
          >
            Create account
          </h2>

          {step === "form" ? (
            <div
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? "translateY(6px)" : "translateY(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      fontFamily: "'Space Mono', monospace",
                      color: "#000",
                    }}
                  >
                    Full name
                  </label>
                  <StableInput
                    className="form-input"
                    value={name}
                    onChangeAction={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      fontFamily: "'Space Mono', monospace",
                      color: "#000",
                    }}
                  >
                    Email
                  </label>
                  <StableInput
                    type="email"
                    className="form-input"
                    value={email}
                    onChangeAction={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@college.edu"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      fontFamily: "'Space Mono', monospace",
                      color: "#000",
                    }}
                  >
                    Phone
                  </label>
                  <StableInput
                    className="form-input"
                    value={phone}
                    onChangeAction={(e) => setPhone(e.target.value)}
                    required
                    placeholder="9876543210"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <PasswordInput
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #000",
                    background: "#000",
                    color: "#fff",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.45 : 1,
                    boxSizing: "border-box",
                    transition: "transform 0.1s ease",
                  }}
                >
                  {submitting ? "CREATING\u2026" : "Create account"}
                </button>
              </form>
            </div>
          ) : (
            <div
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? "translateY(6px)" : "translateY(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              <button
                onClick={handleBack}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  marginBottom: "16px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#000",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                &larr; EDIT DETAILS
              </button>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "#888",
                  marginBottom: "14px",
                }}
              >
                VERIFICATION CODE SENT TO +91 {phone}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
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
                    disabled={submitting}
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
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #000",
                  background: "#000",
                  color: "#fff",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.45 : 1,
                  boxSizing: "border-box",
                  marginTop: "24px",
                  transition: "transform 0.1s ease",
                }}
              >
                {submitting ? "VERIFYING\u2026" : "VERIFY & CREATE ACCOUNT"}
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "18px 0",
              color: "#888",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            <span style={{ flex: 1, height: "1px", background: "#000" }} />
            <span>or</span>
            <span style={{ flex: 1, height: "1px", background: "#000" }} />
          </div>

          <button
            disabled
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "11px",
              border: "1px solid #000",
              background: "#fff",
              color: "#000",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "not-allowed",
              opacity: 0.5,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p
            style={{
              marginTop: "16px",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#888",
            }}
          >
            Already have an account?{" "}
            <Link href="/login" style={{ fontWeight: 700, textDecoration: "underline", color: "#000" }}>
              Sign in
            </Link>
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "32px 0 16px",
            color: "#888",
          }}
        >
          <p style={{ fontSize: "0.85rem", fontWeight: 500, fontFamily: "'Playfair Display', serif", margin: 0 }}>
            Print smarter, not harder.
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              marginTop: "4px",
              opacity: 0.7,
              fontFamily: "'Space Mono', monospace",
              margin: "4px 0 0",
            }}
          >
            Upload once, pick up when ready.
          </p>
        </div>
      </div>
    </div>
  );
}
