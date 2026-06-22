"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "◷" },
  { href: "/upload", label: "Upload", icon: "↑" },
  { href: "/orders/current", label: "Current Orders", icon: "○" },
  { href: "/orders/history", label: "Order History", icon: "◎" },
  { href: "/subscribe", label: "Plan", icon: "◉" },
  { href: "/profile", label: "Profile", icon: "▤" },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        <span className="sidebar-toggle-icon">{open ? "✕" : "☰"}</span>
      </button>

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <Link href={user ? "/dashboard" : "/login"} className="sidebar-brand">
            <span className="brand-mark">P</span>
            <span className="brand-name">Printify</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
              <div className="sidebar-user-info">
                <strong>{user.name}</strong>
                <small>Student</small>
              </div>
            </div>
          )}
          <button
            className="btn btn-secondary btn-sm w-100"
            onClick={() => signOut({ callbackUrl: "/login" })}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <style>{`
        .sidebar-toggle {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 1101;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border-glass);
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 1.2rem;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
        }

        .sidebar-toggle-icon { line-height: 1; }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 240px;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border-right: 1px solid var(--border-glass);
          backdrop-filter: blur(20px);
          z-index: 1100;
          transition: transform var(--transition-normal);
        }

        .sidebar-header {
          padding: 18px 16px 12px;
          border-bottom: 1px solid var(--border-glass);
        }

        .sidebar-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary);
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

        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background: rgba(139, 92, 246, 0.14);
          color: var(--primary-indigo);
        }

        .sidebar-link-icon {
          width: 24px;
          text-align: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 12px 14px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .sidebar-user-info strong { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
        .sidebar-user-info small { font-size: 0.68rem; color: var(--text-muted); }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(34, 211, 238, 0.14);
          color: var(--accent-cyan);
          font-weight: 900;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 1099;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        @media (max-width: 1024px) {
          .sidebar { width: 220px; }
        }

        @media (max-width: 768px) {
          .sidebar-toggle { display: flex; }

          .sidebar {
            transform: translateX(-100%);
            width: 280px;
          }

          .sidebar.sidebar-open {
            transform: translateX(0);
          }

          .sidebar-overlay { display: block; }
        }

        @media (max-width: 375px) {
          .sidebar { width: 260px; }
        }
      `}</style>
    </>
  );
}
