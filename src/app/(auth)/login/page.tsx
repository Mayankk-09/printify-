"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import StableInput from "@/components/StableInput";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [session, router]);

  useEffect(() => {
    if (searchParams.get("reason") === "expired") {
      toast("Session expired. Please log in again.", { icon: "⏰" });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch {
      toast.error("Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page fade-in">
      <div className="login-layout">
        <section className="login-hero">
          <div className="login-brand">P</div>
          <h1 className="hero-desktop">Print coursework, skip the queue.</h1>
          <h1 className="hero-mobile">Print. Pick. Done.</h1>
          <p className="login-hero-text">Upload documents, track pickup status, manage monthly pages, and unlock print room operations from one dashboard.</p>
          <div className="login-tags">
            <span>PDF</span>
            <span>DOCX</span>
            <span>PPTX</span>
            <span>QR Pickup</span>
          </div>
        </section>

        <section className="glass-card login-card slide-up">
          <h2 className="login-card-title">Sign in</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <StableInput
                type="email"
                className="form-input"
                value={email}
                onChangeAction={(e) => setEmail(e.target.value)}
                required
                placeholder="name@college.edu"
              />
            </div>

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />

            <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
              {submitting ? <div className="spinner" /> : "Sign in"}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="btn btn-social" disabled>
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>

          <p className="login-switch">
            Don&apos;t have an account? <Link href="/register">Register</Link>
          </p>
        </section>
      </div>

      <div className="login-footer">
        <p>Print smarter, not harder.</p>
        <p className="login-footer-sub">Upload once, pick up when ready.</p>
      </div>

      <style>{`
        .login-page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
        }
        .login-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 22px;
          position: relative;
          z-index: 1;
        }
        .login-hero { display: flex; flex-direction: column; gap: 16px; max-width: 540px; }
        .login-brand {
          width: 52px; height: 52px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--bg-black);
          color: #fff; font-weight: 900; font-size: 1rem;
          font-family: var(--font-serif);
        }
        .hero-mobile { display: none; }
        .login-hero h1 { font-size: clamp(2rem, 5vw, 3.6rem); line-height: 0.98; letter-spacing: -0.03em; font-family: var(--font-serif); }
        .login-hero-text { color: var(--text-secondary); font-size: 1rem; line-height: 1.7; }
        .login-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .login-tags span {
          border: 1px solid var(--border-primary);
          color: var(--text-secondary); background: var(--bg-card);
          padding: 7px 12px; font-weight: 600; font-size: 0.78rem;
          font-family: var(--font-mono);
        }
        .login-card { padding: 28px; background: var(--bg-card); border: 1px solid var(--border-primary); }
        .login-card-title { font-size: 1.3rem; font-weight: 800; margin-bottom: 20px; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .login-form { display: flex; flex-direction: column; }
        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 18px 0; color: var(--text-muted); font-size: 0.78rem; font-weight: 600;
        }
        .login-divider::before,
        .login-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border-primary);
        }
        .social-login { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
        .btn-social {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 11px;
          background: var(--bg-card); border: 1px solid var(--border-primary);
          color: var(--text-primary); font-weight: 600; font-size: 0.88rem; cursor: pointer;
          transition: background var(--transition-fast), border-color var(--transition-fast);
        }
        .btn-social:hover:not(:disabled) { background: var(--bg-elevated); border-color: var(--text-primary); }
        .btn-social:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-switch { margin-top: 16px; text-align: center; font-size: 0.85rem; color: var(--text-secondary); }
        .login-switch a { font-weight: 700; text-decoration: underline; }
        .login-switch a:hover { text-decoration: none; }
        .login-footer {
          text-align: center; padding: 40px 22px 32px;
          position: relative; z-index: 1; color: var(--text-muted);
        }
        .login-footer p { font-size: 0.85rem; font-weight: 500; font-family: var(--font-serif); }
        .login-footer-sub { font-size: 0.75rem; margin-top: 4px; opacity: 0.7; font-family: var(--font-mono); }

        @media (max-width: 860px) {
          .login-layout { grid-template-columns: 1fr; gap: 20px; padding: 16px; padding-top: calc(16px + env(safe-area-inset-top)); }
          .login-hero { align-items: center; text-align: center; gap: 10px; }
          .login-brand { margin: 0 auto; }
          .hero-desktop { display: none; }
          .hero-mobile { display: block; font-size: 1.6rem; font-family: var(--font-serif); }
          .login-hero-text { display: none; }
          .login-tags { display: none; }
          .login-card { padding: 22px; margin-bottom: 8px; }
          .login-card-title { font-family: var(--font-serif); }
          .login-divider { }
          .login-divider::before, .login-divider::after { }
          .btn-social { }
          .login-switch { }
          .login-switch a { }
          .login-footer { padding: 28px 16px 40px; }
        }
      `}</style>
    </div>
  );
}
