"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PasswordInput from "@/components/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      router.replace("/admin/dashboard");
    } else if (session?.user) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (result?.error) {
        toast.error("Invalid admin credentials");
        return;
      }

      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.user?.role !== "admin") {
        toast.error("Access denied. Admin account required.");
        return;
      }

      toast.success("Welcome to admin console");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card glass-card">
        <div className="admin-login-brand">
          <span className="brand-mark">P</span>
          <h1>Printify Admin</h1>
          <p className="text-secondary">Sign in to manage the print room</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@printify.com"
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
            {submitting ? <div className="spinner" /> : "Sign in to admin"}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-deep);
          padding: 18px;
        }
        .admin-login-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15), transparent 32rem);
          pointer-events: none;
        }
        .admin-login-card {
          width: min(420px, 100%);
          padding: 32px;
          position: relative;
          z-index: 1;
        }
        .admin-login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          text-align: center;
        }
        .admin-login-brand h1 { font-size: 1.5rem; font-weight: 800; }
        .brand-mark {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-indigo), #6366f1);
          color: #fff;
          font-weight: 900;
          font-size: 1rem;
          box-shadow: 0 16px 40px rgba(139, 92, 246, 0.28);
        }
      `}</style>
    </div>
  );
}
