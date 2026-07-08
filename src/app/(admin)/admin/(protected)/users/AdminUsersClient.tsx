"use client";

import { useState, useMemo } from "react";

export default function AdminUsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").includes(q)
      );
    });
  }, [users, search]);

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
                    <td>{u.phone || "—"}</td>
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
                  <div className="au-mc-row"><span>Phone</span><span>{u.phone || "—"}</span></div>
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
        .au-mc-row { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; }
        .au-mc-row span:first-child { color: var(--text-muted); }
        .au-mc-row strong { font-family: var(--font-mono); }
        @media (max-width: 768px) { .au-table-wrap { display: none; } .au-mobile-cards { display: flex; } }
      `}</style>
    </div>
  );
}
