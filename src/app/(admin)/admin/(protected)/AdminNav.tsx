"use client";

import { useSession } from "@/lib/use-session";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◷" },
  { href: "/admin/orders", label: "Orders", icon: "☰" },
  { href: "/admin/users", label: "Users", icon: "○" },
  { href: "/admin/plans", label: "Packs", icon: "◉" },
  { href: "/admin/addons", label: "Add-ons", icon: "⊕" },
  { href: "/admin/subscriptions", label: "Purchases", icon: "◎" },
  { href: "/admin/analytics", label: "Analytics", icon: "▤" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminNav({ user }: { user: any }) {
  const { signOut } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar-top">
          <Link href="/admin/dashboard" className="admin-brand" aria-label="Printify Quick">
            <div className="admin-brand-circle">
              <span className="admin-brand-letter">N</span>
            </div>
            {!collapsed && <span className="admin-brand-name">Printify</span>}
          </Link>
          <button
            className="admin-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {adminLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <span className="admin-nav-icon">{link.icon}</span>
                {!collapsed && <span className="admin-nav-label">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || "A"}</span>
            {!collapsed && (
              <div>
                <strong style={{ fontSize: "0.82rem" }}>{user.name}</strong>
                <small style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "block" }}>Admin</small>
              </div>
            )}
          </div>
          <button className="btn btn-secondary btn-sm w-100" onClick={() => signOut({ redirectUrl: "/" })} type="button">
            {collapsed ? "↩" : "Sign out"}
          </button>
        </div>
      </aside>

      <style>{`
        .admin-sidebar {
          width: 250px;
          min-width: 250px;
          height: 100%;
          background: var(--bg-elevated);
          border-right: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          transition: width var(--transition-normal), min-width var(--transition-normal);
        }

        .admin-sidebar.collapsed {
          width: 72px;
          min-width: 72px;
        }

        .admin-sidebar-top {
          position: relative;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-primary);
        }

        .admin-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--text-primary);
        }

        .admin-collapse-btn {
          position: absolute;
          top: 28px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: 0px;
          border: 1px solid var(--border-primary);
          background: var(--bg-card);
          color: var(--text-secondary);
          padding: 0;
          cursor: pointer;
          font-size: 0.75rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .admin-collapse-btn:hover { background: var(--bg-black); color: #fff; }

        .admin-brand-circle {
          width: 64px;
          height: 64px;
          border-radius: 0px;
          background: var(--bg-black);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-brand-letter {
          font-family: var(--font-serif-alt);
          font-weight: 900;
          font-size: 1.6rem;
          line-height: 1;
        }

        .admin-brand-name {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .admin-sidebar.collapsed .admin-sidebar-top { padding: 24px 8px; }

        .admin-sidebar.collapsed .admin-brand-circle {
          width: 44px;
          height: 44px;
        }

        .admin-sidebar.collapsed .admin-brand-letter { font-size: 1.2rem; }

        .admin-sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .admin-sidebar.collapsed .admin-sidebar-nav { padding: 16px 8px; }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .admin-sidebar.collapsed .admin-nav-item {
          justify-content: center;
          padding: 11px 0;
        }

        .admin-nav-item:hover { background: var(--bg-card); color: var(--text-primary); }
        .admin-nav-item.active { background: var(--bg-black); color: #fff; }

        .admin-nav-icon { font-size: 1rem; width: 24px; text-align: center; flex-shrink: 0; }

        .admin-sidebar.collapsed .admin-sidebar-footer { align-items: center; }

        .admin-sidebar-footer {
          padding: 14px;
          border-top: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 0px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-black);
          color: #fff;
          font-weight: 900;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .btn-sm { min-height: 32px; padding: 6px 12px; font-size: 0.78rem; }
      `}</style>
    </>
  );
}
