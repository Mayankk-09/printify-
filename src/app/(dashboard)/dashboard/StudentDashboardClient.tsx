"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateFull } from "@/lib/pickup";

const TIMELINE_STAGES = [
  { key: "SUBMITTED", label: "Submitted", icon: "📄" },
  { key: "ACCEPTED", label: "Accepted", icon: "✅" },
  { key: "PRINTING", label: "Printing", icon: "🖨️" },
  { key: "READY", label: "Ready", icon: "📦" },
  { key: "COLLECTED", label: "Collected", icon: "✓" },
];

const STATUS_ORDER: Record<string, number> = {
  SUBMITTED: 0,
  ACCEPTED: 1,
  PRINTING: 2,
  READY: 3,
  COLLECTED: 4,
};

export default function StudentDashboardClient({
  user,
  subscriptions,
  totalAllowed,
  totalUsed,
  remainingPages,
  activeOrder,
  hasTrial,
}: {
  user: any;
  subscriptions: any[];
  totalAllowed: number;
  totalUsed: number;
  remainingPages: number;
  activeOrder: any;
  hasTrial: boolean;
}) {
  const router = useRouter();
  const usagePercent = totalAllowed > 0 ? (totalUsed / totalAllowed) * 100 : 0;
  const currentStage = activeOrder ? STATUS_ORDER[activeOrder.status] ?? -1 : -1;
  const pickupCode = activeOrder?.pickupCode?.code;

  return (
    <div className="sd fade-in">
      <section className="glass-card sd-hero">
        <div className="sd-hero-content">
          <div className="sd-avatar">{user.name?.charAt(0)?.toUpperCase() || "S"}</div>
          <div>
            <span className="eyebrow">Welcome back</span>
            <h1 className="page-title" style={{ margin: 0 }}>{user.name}</h1>
            {user.phone && <p className="text-secondary text-sm">{user.phone}</p>}
          </div>
        </div>
        <div className="sd-hero-stats">
          <div className="sd-stat">
            <strong>{remainingPages}</strong>
            <span>Pages left</span>
          </div>
          <div className="sd-stat">
            <strong>{subscriptions.length}</strong>
            <span>Pack{subscriptions.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="sd-stat">
            <strong>{activeOrder ? 1 : 0}</strong>
            <span>Active job</span>
          </div>
        </div>
      </section>

      <div className="sd-grid">
        <section className="glass-card sd-balance">
          <h2 className="sd-section-title">Page Balance</h2>
          <div className="sd-balance-ring">
            <svg viewBox="0 0 120 120" className="sd-ring-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="#000000"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - usagePercent / 100)}`}
                transform="rotate(-90, 60, 60)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
              <text x="60" y="56" textAnchor="middle" fill="var(--text-primary)" fontSize="1.8rem" fontWeight="800">
                {remainingPages}
              </text>
              <text x="60" y="76" textAnchor="middle" fill="var(--text-muted)" fontSize="0.6rem">
                remaining
              </text>
            </svg>
          </div>
          <div className="sd-balance-bar">
            <div className="sd-balance-track">
              <div className="sd-balance-fill" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
            <span className="text-muted text-sm">{totalUsed} / {totalAllowed} pages used</span>
          </div>
          <Link href="/upload" className="btn btn-primary w-100" style={{ marginTop: 12 }}>
            Upload Document
          </Link>
        </section>

        {activeOrder ? (
          <section className="glass-card sd-order">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 className="sd-section-title">Current Order</h2>
              <Link href="/orders/current" className="text-sm">
                View details
              </Link>
            </div>

            <div className="sd-order-info">
              <div className="sd-order-file">
                <span className="text-muted text-sm">Document</span>
                <strong>{activeOrder.fileName}</strong>
              </div>
              <div className="sd-order-meta">
                <div>
                  <span className="text-muted text-sm">Pages</span>
                  <strong>{activeOrder.pages} × {activeOrder.copies}</strong>
                </div>
                <div>
                  <span className="text-muted text-sm">Mode</span>
                  <strong>{activeOrder.printMode === "BW" ? "B&W" : "Color"}</strong>
                </div>
                <div>
                  <span className="text-muted text-sm">Order #</span>
                  <strong>{activeOrder.orderNumber}</strong>
                </div>
              </div>
            </div>

            {pickupCode && (
              <div className="sd-pickup-code">
                <span className="text-muted text-sm">Pickup Code</span>
                <strong className="sd-pickup-value">{pickupCode}</strong>
              </div>
            )}

            <div className="sd-timeline">
              {TIMELINE_STAGES.map((stage, i) => {
                const isActive = i <= currentStage;
                const isCurrent = i === currentStage;
                const isLast = i === TIMELINE_STAGES.length - 1;
                return (
                  <div key={stage.key} className={`sd-timeline-step ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                    <div className="sd-timeline-node">
                      <div className="sd-timeline-dot" />
                      {!isLast && <div className="sd-timeline-line" />}
                    </div>
                    <div className="sd-timeline-content">
                      <span className="sd-timeline-icon">{stage.icon}</span>
                      <span className="sd-timeline-label">{stage.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="glass-card sd-no-order">
            <div className="sd-no-order-content">
              <span style={{ fontSize: "3rem" }}>📄</span>
              <h2>No active orders</h2>
              <p className="text-secondary text-sm">Upload a document to get started.</p>
              <Link href="/upload" className="btn btn-primary">
                Upload Document
              </Link>
            </div>
          </section>
        )}
      </div>

      <section className="sd-actions">
        <Link href="/upload" className="glass-card sd-action-card">
          <span className="sd-action-icon">📤</span>
          <h3>Upload</h3>
          <p className="text-secondary text-sm">Submit a print job</p>
        </Link>
        <Link href="/subscribe" className="glass-card sd-action-card">
          <span className="sd-action-icon">📦</span>
          <h3>Buy Packs</h3>
          <p className="text-secondary text-sm">Purchase page packs</p>
        </Link>
        <Link href="/orders/current" className="glass-card sd-action-card">
          <span className="sd-action-icon">📋</span>
          <h3>Current Orders</h3>
          <p className="text-secondary text-sm">Track active orders</p>
        </Link>
        <Link href="/orders/history" className="glass-card sd-action-card">
          <span className="sd-action-icon">📜</span>
          <h3>Order History</h3>
          <p className="text-secondary text-sm">Past orders</p>
        </Link>
      </section>

      <style>{`
        .sd { display: flex; flex-direction: column; gap: 16px; }
        .sd-hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 24px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .sd-hero-content { display: flex; align-items: center; gap: 16px; }
        .sd-avatar { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: var(--bg-black); color: #fff; font-weight: 900; font-size: 1.2rem; flex-shrink: 0; font-family: var(--font-serif); }
        .sd-hero-stats { display: flex; gap: 24px; }
        .sd-stat { text-align: center; }
        .sd-stat strong { display: block; font-size: 1.5rem; font-weight: 800; font-family: var(--font-serif-alt); letter-spacing: -0.03em; }
        .sd-stat span { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.06em; }
        .sd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .sd-section-title { font-size: 1rem; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .sd-balance { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .sd-balance-ring { width: 140px; height: 140px; }
        .sd-ring-svg { width: 100%; height: 100%; }
        .sd-balance-bar { width: 100%; }
        .sd-balance-track { height: 4px; background: var(--border-light); overflow: hidden; margin-bottom: 6px; }
        .sd-balance-fill { height: 100%; background: var(--bg-black); transition: width 0.5s ease; }
        .sd-order { padding: 24px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .sd-order-info { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .sd-order-file { display: flex; flex-direction: column; gap: 2px; }
        .sd-order-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; border-top: 1px solid var(--border-light); padding-top: 12px; }
        .sd-order-meta div { display: flex; flex-direction: column; gap: 2px; }
        .sd-order-meta strong { font-family: var(--font-mono); font-size: 0.85rem; }
        .sd-pickup-code { text-align: center; margin-bottom: 16px; }
        .sd-pickup-value { display: inline-block; padding: 8px 24px; border: 2px solid var(--border-primary); font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; letter-spacing: 0.12em; background: var(--bg-card); }
        .sd-timeline { display: flex; flex-direction: column; gap: 0; position: relative; }
        .sd-timeline-step { display: flex; gap: 12px; min-height: 48px; }
        .sd-timeline-node { display: flex; flex-direction: column; align-items: center; width: 24px; flex-shrink: 0; }
        .sd-timeline-dot { width: 12px; height: 12px; background: var(--border-light); border: 2px solid var(--border-secondary); flex-shrink: 0; z-index: 1; }
        .sd-timeline-step.active .sd-timeline-dot { background: var(--bg-black); border-color: var(--bg-black); }
        .sd-timeline-step.current .sd-timeline-dot { outline: 3px solid var(--border-light); outline-offset: 2px; }
        .sd-timeline-line { width: 2px; flex: 1; background: var(--border-light); margin: 2px 0; }
        .sd-timeline-step.active .sd-timeline-line { background: var(--bg-black); }
        .sd-timeline-content { display: flex; align-items: center; gap: 8px; padding: 4px 0; min-height: 48px; }
        .sd-timeline-icon { font-size: 1rem; }
        .sd-timeline-label { font-size: 0.88rem; font-weight: 600; }
        .sd-timeline-step.active .sd-timeline-label { color: var(--text-primary); }
        .sd-no-order { padding: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-light); }
        .sd-no-order-content { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .sd-no-order-content h2 { font-size: 1.2rem; }
        .sd-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .sd-action-card { padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 6px; border: 1px solid var(--border-light); background: var(--bg-card); transition: background var(--transition-fast); }
        .sd-action-card:hover { background: var(--bg-black); }
        .sd-action-card:hover h3, .sd-action-card:hover p { color: #fff; }
        .sd-action-card:active { transform: scale(0.99); }
        .sd-action-card h3 { font-weight: 700; }
        .sd-action-icon { font-size: 1.5rem; }
        .sd-action-card p { color: var(--text-muted); }
        @media (max-width: 860px) {
          .sd-grid { grid-template-columns: 1fr; }
          .sd-actions { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .sd-action-card { padding: 14px; }
          .sd-hero { flex-direction: column; text-align: center; padding: 18px; gap: 12px; }
          .sd-hero-content { flex-direction: column; }
          .sd-hero-stats { gap: 16px; justify-content: center; }
          .sd-stat strong { font-size: 1.2rem; }
          .sd-order-meta { grid-template-columns: 1fr; }
          .sd-order { padding: 18px; }
          .sd-balance { padding: 18px; }
          .sd-balance-ring { width: 120px; height: 120px; }
        }
      `}</style>
    </div>
  );
}
