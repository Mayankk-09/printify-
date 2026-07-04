"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const isStudent = user?.role === "student";
  const isStaff = user?.role === "admin";

  const [remainingPages, setRemainingPages] = useState<number | null>(null);

  useEffect(() => {
    if (isStudent) {
      fetch("/api/subscriptions/mine")
        .then((r) => r.json())
        .then((d) => setRemainingPages(d.remainingPages ?? 0))
        .catch(() => setRemainingPages(0));
    }
  }, [isStudent]);

  const navLinks = isStudent
    ? [
        { href: "/dashboard", label: "Home" },
        { href: "/upload", label: "Upload" },
        { href: "/subscribe", label: "Packs" },
      ]
    : isStaff
      ? [{ href: "/admin/dashboard", label: "Console" }]
      : [];

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-inner">
          <Link href={user ? (isStudent ? "/dashboard" : "/admin/dashboard") : "/login"} className="brand-btn">
            <span className="brand-mark">P</span>
            <span className="brand-name">Printify</span>
          </Link>

          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-btn ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                {isStudent && remainingPages !== null && (
                  <div className="pages-pill">
                    <span className="pages-count">{remainingPages}</span>
                    <span className="pages-label">pages left</span>
                  </div>
                )}
                <div className="user-chip">
                  <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <small>{isStudent ? "Student" : user.role}</small>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => signOut({ callbackUrl: "/login" })} type="button">
                  Sign out
                </button>
              </>
            ) : (
              <span className="nav-tagline">Campus printing</span>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        .main-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(7, 11, 20, 0.82);
          backdrop-filter: blur(20px);
        }

        .navbar-inner {
          max-width: 1180px;
          margin: 0 auto;
          min-height: 64px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .brand-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          padding: 4px;
          text-decoration: none;
        }

        .brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-indigo), #6366f1);
          color: #ffffff;
          font-weight: 900;
          font-size: 0.85rem;
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25);
        }

        .brand-name {
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: -0.02em;
        }

        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-btn {
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 600;
          padding: 8px 13px;
          font-size: 0.88rem;
          transition: background var(--transition-fast), color var(--transition-fast);
          text-decoration: none;
        }

        .nav-btn.active,
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          color: var(--text-primary);
        }

        .nav-actions { display: flex; align-items: center; gap: 10px; }

        .pages-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 12px;
        }

        .pages-count { font-weight: 800; font-size: 0.9rem; color: var(--accent-cyan); }
        .pages-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

        .user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 10px;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(34, 211, 238, 0.14);
          color: var(--accent-cyan);
          font-weight: 900;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .user-info { display: flex; flex-direction: column; line-height: 1.15; }
        .user-info strong { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
        .user-info small { font-size: 0.68rem; color: var(--text-muted); text-transform: capitalize; }

        .btn-sm { min-height: 32px; padding: 6px 12px; border-radius: 9px; font-size: 0.78rem; }
        .nav-tagline { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }

        @media (max-width: 860px) {
          .navbar-inner { min-height: 56px; padding: 0 14px; }
          .nav-links-desktop, .pages-pill, .user-chip, .btn-sm { display: none; }
          .brand-name { font-size: 0.95rem; }
        }
      `}</style>
    </>
  );
}
