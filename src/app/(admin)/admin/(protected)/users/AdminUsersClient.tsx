"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

function CopyPhone({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 1500);
    });
  }, [phone]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="au-copy-btn"
      title="Click to copy"
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="0" />
          <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
        </svg>
      )}
    </button>
  );
}

function UserDetails({ u }: { u: any }) {
  return (
    <div className="au-details-grid">
      <div className="au-detail-item">
        <span className="au-detail-label">Email</span>
        <span className="au-detail-value">{u.email}</span>
      </div>
      <div className="au-detail-item">
        <span className="au-detail-label">Phone</span>
        <span className="au-detail-value">
          {u.phone ? (
            <span className="au-phone-cell">
              <span>{u.phone}</span>
              <CopyPhone phone={u.phone} />
            </span>
          ) : (
            "—"
          )}
        </span>
      </div>
      <div className="au-detail-item">
        <span className="au-detail-label">Plan</span>
        <span className="au-detail-value">{u.subscriptions[0]?.pack?.name || "None"}</span>
      </div>
      <div className="au-detail-item">
        <span className="au-detail-label">Orders</span>
        <span className="au-detail-value">{u._count.orders}</span>
      </div>
      <div className="au-detail-item">
        <span className="au-detail-label">Joined</span>
        <span className="au-detail-value">{new Date(u.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function AdminUsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  const toggleUser = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Users</span>
        <h1 className="page-title">Manage students</h1>
        <p className="text-secondary">{users.length} total users</p>
      </div>

      <div className="au-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="au-search-input"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="au-empty">No users found.</div>
      ) : (
        <div className="au-list">
          {filteredUsers.map((u) => {
            const isOpen = expandedId === u.id;
            return (
              <div key={u.id} className="au-user">
                <button
                  type="button"
                  className={`au-row ${isOpen ? "open" : ""}`}
                  onClick={() => toggleUser(u.id)}
                  aria-expanded={isOpen}
                >
                  <span className="au-avatar">{u.name.charAt(0)?.toUpperCase() || "U"}</span>
                  <span className="au-name">{u.name}</span>
                  <span className={`au-role ${u.role === "admin" ? "au-role-admin" : "au-role-student"}`}>
                    {u.role}
                  </span>
                  <span className="au-chevron">{isOpen ? "⌃" : "⌄"}</span>
                </button>
                <div className={`au-details ${isOpen ? "open" : ""}`}>
                  <div className="au-details-inner">
                    <div className="au-details-body">
                      <UserDetails u={u} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .au-search {
          position: relative;
          margin-bottom: 20px;
        }

        .au-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .au-search-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          font-size: 0.9rem;
          font-family: var(--font-sans);
          color: var(--text-primary);
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 0px;
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .au-search-input::placeholder { color: var(--text-muted); }

        .au-search-input:focus {
          border-color: var(--text-primary);
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .au-list {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 0px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .au-user {
          border-bottom: 1px solid #f0f0f0;
        }

        .au-user:last-child { border-bottom: none; }

        .au-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
          transition: background var(--transition-fast);
        }

        .au-row:hover { background: #fafaf9; }
        .au-row.open { background: #fafaf9; }

        .au-avatar {
          width: 40px;
          height: 40px;
          border-radius: 0px;
          background: var(--bg-black);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .au-name {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .au-role {
          flex-shrink: 0;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 0px;
        }

        .au-role-student {
          background: #f5f5f5;
          border: 1px solid #e5e5e5;
          color: #525252;
        }

        .au-role-admin {
          background: var(--bg-black);
          border: 1px solid var(--bg-black);
          color: #ffffff;
        }

        .au-chevron {
          flex-shrink: 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .au-row.open .au-chevron { transform: rotate(180deg); }

        .au-details {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .au-details.open { grid-template-rows: 1fr; }

        .au-details-inner { overflow: hidden; min-height: 0; }

        .au-details-body {
          padding: 18px 20px 22px 74px;
          border-top: 1px solid #f0f0f0;
        }

        .au-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .au-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .au-detail-label {
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }

        .au-detail-value {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary);
          word-break: break-word;
        }

        .au-phone-cell { display: inline-flex; align-items: center; gap: 8px; }

        .au-copy-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: 1px solid var(--border-secondary);
          border-radius: 0px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.15s ease, color 0.15s ease;
        }

        .au-copy-btn:hover { border-color: var(--border-primary); color: var(--text-primary); }

        .au-empty {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 0px;
          padding: 48px 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .au-row { padding: 12px 16px; gap: 12px; }
          .au-avatar { width: 36px; height: 36px; font-size: 0.8rem; }
          .au-details-body { padding: 14px 16px 18px; }
          .au-details-grid { grid-template-columns: 1fr; gap: 14px; }
        }
      `}</style>
    </div>
  );
}
