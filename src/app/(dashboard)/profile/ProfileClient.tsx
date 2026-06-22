"use client";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfileClient({ user }: { user: { name: string; email: string; phone: string | null; createdAt: Date } }) {
  return (
    <div className="pf fade-in">
      <div className="pf-head">
        <span className="eyebrow">Profile</span>
        <h1 className="page-title">Account</h1>
      </div>

      <div className="glass-card">
        <div className="pf-avatar">
          <span className="pf-avatar-letter">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
          <div>
            <h2>{user.name}</h2>
            <p className="text-secondary">Student</p>
          </div>
        </div>
        <div className="pf-details">
          <div className="pf-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="pf-row">
            <span>Phone</span>
            <strong>{user.phone || "Not set"}</strong>
          </div>
          <div className="pf-row">
            <span>Member since</span>
            <strong>{formatDate(user.createdAt)}</strong>
          </div>
        </div>
      </div>

      <style>{`
        .pf { display: flex; flex-direction: column; gap: 16px; }
        .pf-head { margin-bottom: 4px; }
        .pf-avatar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .pf-avatar-letter { width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: rgba(34,211,238,0.14); color: var(--accent-cyan); font-weight: 900; font-size: 1.4rem; }
        .pf-avatar h2 { font-size: 1.1rem; font-weight: 800; }
        .pf-details { display: flex; flex-direction: column; gap: 12px; }
        .pf-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; }
        .pf-row span { color: var(--text-muted); font-size: 0.85rem; }
        .pf-row strong { color: var(--text-primary); font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
