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
    </div>
  );
}
