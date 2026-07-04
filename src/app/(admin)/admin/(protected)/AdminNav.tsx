"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar-header">
          <Link href="/admin/dashboard" className="admin-brand">
            <span className="brand-mark">P</span>
            {!collapsed && <span className="brand-name">Printify</span>}
          </Link>
          <button className="admin-collapse-btn" onClick={() => setCollapsed(!collapsed)} type="button">
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
          <button className="btn btn-secondary btn-sm w-100" onClick={() => signOut({ callbackUrl: "/admin/login" })} type="button">
            {collapsed ? "↩" : "Sign out"}
          </button>
        </div>
      </aside>

      <style>{`
        .admin-sidebar {
          width: 240px;
          min-width: 240px;
          background: var(--bg-card);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          transition: width var(--transition-normal);
        }

        .admin-sidebar.collapsed {
          width: 64px;
          min-width: 64px;
        }

        .admin-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-glass);
          gap: 8px;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary);
        }

        .admin-collapse-btn {
          border: 1px solid var(--border-glass);
          background: rgba(255,255,255,0.06);
          color: var(--text-secondary);
          border-radius: 8px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .admin-sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-nav-item {
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

        .admin-nav-item:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        .admin-nav-item.active { background: rgba(139,92,246,0.15); color: var(--text-primary); }

        .admin-nav-icon { font-size: 1rem; width: 24px; text-align: center; flex-shrink: 0; }

        .admin-sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-mark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-indigo), #6366f1);
          color: #fff;
          font-weight: 900;
          font-size: 0.75rem;
          flex-shrink: 0;
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

        .btn-sm { min-height: 32px; padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; }

        @media (max-width: 860px) {
          .admin-sidebar { width: 64px; min-width: 64px; }
          .admin-sidebar .brand-name,
          .admin-sidebar .admin-nav-label,
          .admin-sidebar .admin-user-info div { display: none; }
          .admin-collapse-btn { display: none; }
        }
      `}</style>
    </>
  );
}
