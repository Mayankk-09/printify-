"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

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
          <h1>Print coursework, skip the queue.</h1>
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
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <p className="login-switch">
            Don&apos;t have an account? <Link href="/register">Register</Link>
          </p>
        </section>
      </div>

      <style>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; background: var(--bg-deep); }
        .login-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.12), transparent 32rem),
            radial-gradient(ellipse at 90% 8%, rgba(34, 211, 238, 0.08), transparent 28rem);
          pointer-events: none;
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
          width: 52px; height: 52px; border-radius: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--primary-indigo), #6366f1);
          color: #fff; font-weight: 900; font-size: 1rem;
          box-shadow: 0 16px 40px rgba(139, 92, 246, 0.28);
        }
        .login-hero h1 { font-size: clamp(2rem, 5vw, 3.6rem); line-height: 0.98; letter-spacing: -0.03em; }
        .login-hero-text { color: var(--text-secondary); font-size: 1rem; line-height: 1.7; }
        .login-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .login-tags span {
          border: 1px solid var(--border-glass); border-radius: 999px;
          color: var(--text-secondary); background: rgba(255,255,255,0.04);
          padding: 7px 12px; font-weight: 600; font-size: 0.78rem;
        }
        .login-card { padding: 28px; }
        .login-card-title { font-size: 1.3rem; font-weight: 800; margin-bottom: 20px; }
        .login-form { display: flex; flex-direction: column; }
        .login-switch { margin-top: 16px; text-align: center; font-size: 0.85rem; color: var(--text-secondary); }
        .login-switch a { color: var(--primary-indigo); font-weight: 700; }
        .login-switch a:hover { text-decoration: underline; }

        @media (max-width: 860px) {
          .login-layout { grid-template-columns: 1fr; gap: 24px; padding: 16px; }
          .login-hero h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
