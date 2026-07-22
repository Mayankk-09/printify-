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

export default function AdminUsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Users</span>
        <h1 className="page-title">Manage students</h1>
        <p className="text-secondary">{users.length} total users</p>
      </div>

      <div className="glass-card">
        <div style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Desktop table */}
        <div className="au-table-wrap">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Orders</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      {u.phone ? (
                        <span className="au-phone-cell">
                          <span>{u.phone}</span>
                          <CopyPhone phone={u.phone} />
                        </span>
                      ) : "—"}
                    </td>
                    <td><span className="status-badge status-READY">{u.role}</span></td>
                    <td>{u.subscriptions[0]?.pack?.name || "None"}</td>
                    <td>{u._count.orders}</td>
                    <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                  </tr>
                ))}
                {!filteredUsers.length && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state compact"><p>No users found.</p></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="au-mobile-cards">
          {filteredUsers.length === 0 ? (
            <div className="empty-state compact"><p>No users found.</p></div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="glass-card au-mobile-card">
                <div className="au-mc-head">
                  <span className="au-mc-avatar">{u.name.charAt(0)?.toUpperCase() || "U"}</span>
                  <div>
                    <strong>{u.name}</strong>
                    <span className="text-muted text-sm">{u.email}</span>
                  </div>
                  <span className={`status-badge status-READY`} style={{ fontSize: "0.65rem", padding: "2px 8px" }}>{u.role}</span>
                </div>
                <div className="au-mc-body">
                  <div className="au-mc-row">
                    <span>Phone</span>
                    {u.phone ? (
                      <span className="au-phone-cell">
                        <span>{u.phone}</span>
                        <CopyPhone phone={u.phone} />
                      </span>
                    ) : <span>—</span>}
                  </div>
                  <div className="au-mc-row"><span>Plan</span><strong>{u.subscriptions[0]?.pack?.name || "None"}</strong></div>
                  <div className="au-mc-row"><span>Orders</span><strong>{u._count.orders}</strong></div>
                  <div className="au-mc-row"><span>Joined</span><span>{new Date(u.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .au-mobile-cards { display: none; flex-direction: column; gap: 12px; }
        .au-mobile-card { padding: 16px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .au-mobile-card:active { transform: scale(0.99); }
        .au-mc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .au-mc-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--bg-black); color: #fff; font-weight: 900; font-size: 0.85rem; flex-shrink: 0; }
        .au-mc-head div { flex: 1; display: flex; flex-direction: column; }
        .au-mc-body { display: grid; gap: 6px; }
        .au-mc-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.82rem; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; }
        .au-mc-row span:first-child { color: var(--text-muted); }
        .au-mc-row strong { font-family: var(--font-mono); }
        .au-phone-cell { display: inline-flex; align-items: center; gap: 6px; }
        .au-copy-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: 1px solid var(--border-secondary); background: transparent; color: var(--text-muted); cursor: pointer; flex-shrink: 0; transition: border-color 0.15s ease, color 0.15s ease; }
        .au-copy-btn:hover { border-color: var(--border-primary); color: var(--text-primary); }
        @media (max-width: 768px) { .au-table-wrap { display: none; } .au-mobile-cards { display: flex; } }
      `}</style>
    </div>
  );
}
