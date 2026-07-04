"use client";

import Link from "next/link";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const remaining = (sub: any) => (sub?.pagesAllowed ?? 0) - (sub?.pagesUsed ?? 0);

export default function ProfileClient({ user, subscription }: { user: { name: string; email: string; phone: string | null; createdAt: Date }; subscription: any }) {
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

      <div className="glass-card">
        <h3 className="pf-section-title">Current Pack</h3>
        {subscription ? (
          <div className="pf-pack">
            <div className="pf-pack-card">
              <span className="pf-pack-name">{subscription.pack?.name || "Pack"}</span>
              <div className="pf-pack-meta">
                <div className="pf-pack-stat">
                  <span>Pages remaining</span>
                  <strong className="pf-remaining">{remaining(subscription)}</strong>
                </div>
                <div className="pf-pack-stat">
                  <span>Total pages</span>
                  <strong>{subscription.pagesAllowed}</strong>
                </div>
                <div className="pf-pack-stat">
                  <span>Pages used</span>
                  <strong>{subscription.pagesUsed || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pf-no-pack">
            <p className="text-secondary text-sm">You don&apos;t have an active pack.</p>
            <Link href="/subscribe" className="btn btn-primary btn-sm">
              Buy a pack
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .pf { display: flex; flex-direction: column; gap: 16px; }
        .pf-head { margin-bottom: 4px; }
        .pf-section-title { font-size: 0.95rem; font-weight: 800; margin-bottom: 12px; }
        .pf-avatar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .pf-avatar-letter { width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: rgba(34,211,238,0.14); color: var(--accent-cyan); font-weight: 900; font-size: 1.4rem; }
        .pf-avatar h2 { font-size: 1.1rem; font-weight: 800; }
        .pf-details { display: flex; flex-direction: column; gap: 12px; }
        .pf-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; }
        .pf-row span { color: var(--text-muted); font-size: 0.85rem; }
        .pf-row strong { color: var(--text-primary); font-size: 0.9rem; }
        .pf-pack-card { display: flex; flex-direction: column; gap: 10px; border: 1px solid var(--border-active); border-radius: 12px; padding: 14px; background: rgba(139,92,246,0.06); }
        .pf-pack-name { font-weight: 800; font-size: 1rem; }
        .pf-pack-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .pf-pack-stat { display: flex; flex-direction: column; gap: 1px; }
        .pf-pack-stat span { font-size: 0.68rem; color: var(--text-muted); }
        .pf-pack-stat strong { font-size: 1.1rem; }
        .pf-remaining { color: var(--accent-cyan); }
        .pf-no-pack { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      `}</style>
    </div>
  );
}
