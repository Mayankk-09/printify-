"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSlotLabel } from "@/lib/slots";

const statusSteps = ["SUBMITTED", "ACCEPTED", "PRINTING", "READY", "COLLECTED"];
const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  PRINTING: "Printing",
  READY: "Ready for Pickup",
  COLLECTED: "Collected",
};
const statusDescriptions: Record<string, string> = {
  SUBMITTED: "Your document has been received",
  ACCEPTED: "Your order has been reviewed and accepted",
  PRINTING: "Your document is being printed",
  READY: "Ready for pickup at the print room",
  COLLECTED: "Order collected successfully",
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getPickupCode(order: any): string {
  if (order.pickupCode?.code) return order.pickupCode.code;
  return `P-${order.orderNumber?.slice(-4) || "0000"}`;
}

function getStatusIndex(status: string): number {
  return statusSteps.indexOf(status);
}

function getStatusTimestamp(order: any, status: string): Date | null {
  switch (status) {
    case "SUBMITTED": return order.submittedAt || order.createdAt;
    case "ACCEPTED": return order.acceptedAt || null;
    case "PRINTING": return order.printingAt || null;
    case "READY": return order.readyAt || null;
    case "COLLECTED": return order.collectedAt || null;
    default: return null;
  }
}

export default function StudentDashboardClient({
  user,
  subscription,
  activeOrder,
}: {
  user: any;
  subscription: any;
  activeOrder: any | null;
}) {
  const { data: session } = useSession();
  const [orders] = useState(activeOrder ? [activeOrder] : []);

  const totalPages = subscription?.pagesAllowed || 0;
  const usedPages = subscription?.pagesUsed || 0;
  const remainingPages = Math.max(0, totalPages - usedPages);
  const usagePercent = totalPages ? Math.min(100, Math.round((usedPages / totalPages) * 100)) : 0;

  const currentOrder = orders[0] || null;
  const currentStatusIndex = currentOrder ? getStatusIndex(currentOrder.status) : -1;

  const hasSubscription = subscription?.status === "active";

  return (
    <div className="sd fade-in">
      <section className="sd-hero glass-card">
        <div className="sd-hero-copy">
          <span className="eyebrow">Dashboard</span>
          <h1>Hey, {user.name?.split(" ")[0] || "Student"}</h1>
          <p className="text-secondary">
            {hasSubscription
              ? `${remainingPages} pages remaining on your ${subscription.plan?.name || "current"} plan`
              : "No active plan. Pay per print."}
          </p>
          <Link href="/upload" className="btn btn-primary">
            ↑ Upload document
          </Link>
        </div>
        <div className="sd-hero-metrics">
          {[
            [remainingPages, "Remaining pages"],
            [hasSubscription ? subscription?.plan?.name || "Plan" : "Pay per print", "Current plan"],
            [currentOrder ? getSlotLabel(currentOrder.pickupSlot) || "—" : "—", "Next pickup"],
            [currentOrder ? "1" : "0", "Active jobs"],
          ].map(([val, label]) => (
            <div key={label} className="sd-hero-metric">
              <span className="sd-hero-val">{val}</span>
              <span className="sd-hero-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="sd-main-grid">
        <div className={`glass-card sd-sub ${hasSubscription ? "active-glow" : ""}`}>
          <div className="sd-sub-head">
            <div>
              <span className="eyebrow">Subscription</span>
              <h2>{hasSubscription ? subscription?.plan?.name : "No active plan"}</h2>
            </div>
            <span className={`status-badge ${hasSubscription ? "status-READY" : "status-SUBMITTED"}`}>
              {hasSubscription ? "active" : "inactive"}
            </span>
          </div>
          {hasSubscription ? (
            <>
              <div className="sd-sub-ring" style={{ "--usage": `${usagePercent}%` } as React.CSSProperties}>
                <div className="sd-sub-ring-inner">
                  <strong>{remainingPages}</strong>
                  <span>left</span>
                </div>
              </div>
              <div className="sd-sub-info">
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${usagePercent}%` }} />
                </div>
                <p>{usedPages} of {totalPages} pages used</p>
                <p className="text-muted text-sm">Expires {formatDate(subscription.expiryDate)}</p>
              </div>
            </>
          ) : (
            <div className="empty-state compact" style={{ margin: "12px 0" }}>
              <p>Pay per page — no subscription needed</p>
            </div>
          )}
          <Link href="/subscribe" className="btn btn-secondary w-100">
            {hasSubscription ? "Change plan" : "Choose plan"}
          </Link>
        </div>

        <div className="glass-card sd-active-order">
          <div className="sd-section-head">
            <h2>Current Active Order</h2>
          </div>
          {currentOrder ? (
            <>
              <div className="sd-active-order-details">
                <div className="sd-aod-row">
                  <span>File</span>
                  <strong>{currentOrder.fileName}</strong>
                </div>
                <div className="sd-aod-row">
                  <span>Pages</span>
                  <strong>{currentOrder.pages}</strong>
                </div>
                <div className="sd-aod-row">
                  <span>Copies</span>
                  <strong>{currentOrder.copies}</strong>
                </div>
                <div className="sd-aod-row">
                  <span>Print type</span>
                  <strong>{currentOrder.printMode === "COLOR" ? "Color" : "B&W"} / {currentOrder.printSide === "DOUBLE" ? "Double" : "Single"}</strong>
                </div>
                <div className="sd-aod-row">
                  <span>Status</span>
                  <span className={`status-badge status-${currentOrder.status}`}>
                    {statusLabels[currentOrder.status] || currentOrder.status}
                  </span>
                </div>
                {currentOrder.pickupSlot && (
                  <div className="sd-aod-row">
                    <span>Pickup slot</span>
                    <strong>{getSlotLabel(currentOrder.pickupSlot)}</strong>
                  </div>
                )}
              </div>
              {currentOrder.status === "READY" && (
                <div className="sd-pickup-code-section">
                  <span className="eyebrow">PICKUP CODE</span>
                  <strong className="sd-pickup-code-large">{getPickupCode(currentOrder)}</strong>
                </div>
              )}
              <Link href="/orders/current" className="btn btn-secondary w-100" style={{ marginTop: 8 }}>
                View All Orders →
              </Link>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No active print jobs</h3>
              <p>Upload a document to start a new print order.</p>
              <Link href="/upload" className="btn btn-primary">
                Upload document
              </Link>
            </div>
          )}
        </div>
      </div>

      <section className="sd-tracking-section">
        <div className="sd-tracking glass-card">
          <div className="sd-section-head">
            <h2>Track Your Document</h2>
          </div>
          {currentOrder ? (
            <div className="sd-timeline">
              {statusSteps.map((step, i) => {
                const isCompleted = i < currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                const isFuture = i > currentStatusIndex;
                const timestamp = getStatusTimestamp(currentOrder, step);

                return (
                  <div key={step} className={`sd-tl-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isFuture ? "future" : ""}`}>
                    <div className="sd-tl-line">
                      <div className={`sd-tl-dot ${isCompleted ? "dot-completed" : ""} ${isCurrent ? "dot-current" : ""} ${isFuture ? "dot-future" : ""}`}>
                        {isCompleted ? "✓" : isCurrent ? "●" : "○"}
                      </div>
                      {i < statusSteps.length - 1 && <div className={`sd-tl-connector ${isCompleted ? "connector-done" : ""}`} />}
                    </div>
                    <div className="sd-tl-content">
                      <strong>{statusLabels[step]}</strong>
                      <p>{statusDescriptions[step]}</p>
                      {timestamp && (
                        <span className="sd-tl-time">{formatDate(timestamp)} at {formatTime(timestamp)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state compact">
              <p>No active orders to track. Upload a document to get started.</p>
            </div>
          )}
        </div>

        <div className="glass-card sd-actions">
          <div className="sd-section-head">
            <h2>Student Actions</h2>
          </div>
          <div className="sd-actions-grid">
            {[
              ["↑ Upload Document", "Start a new print job", "/upload"],
              ["○ Current Orders", "View active print orders", "/orders/current"],
              ["◎ Order History", "View past orders", "/orders/history"],
              ["◉ Manage Subscription", "Change or renew plan", "/subscribe"],
              ["? Support", "Contact print room", "/dashboard"],
            ].map(([title, desc, href]) => (
              <Link key={title} href={href} className="sd-action-btn">
                <strong>{title}</strong>
                <span>{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .sd { display: flex; flex-direction: column; gap: 16px; }
        .sd-hero { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; padding: 24px; }
        .sd-hero-copy { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
        .sd-hero-copy h1 { font-size: clamp(1.6rem, 4vw, 2.8rem); line-height: 1; letter-spacing: -0.02em; }
        .sd-hero-copy p { font-size: 0.92rem; line-height: 1.6; }
        .sd-hero-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .sd-hero-metric { border: 1px solid var(--border-glass); border-radius: 12px; background: rgba(255,255,255,0.04); padding: 14px; display: flex; flex-direction: column; gap: 4px; }
        .sd-hero-val { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); text-transform: capitalize; }
        .sd-hero-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }
        .sd-section-head h2 { font-size: 1rem; font-weight: 800; margin-bottom: 12px; }

        .sd-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: stretch; }

        .sd-sub { display: flex; flex-direction: column; gap: 12px; }
        .sd-sub-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .sd-sub-head h2 { font-size: 1rem; font-weight: 800; margin-top: 4px; margin-bottom: 0; }
        .sd-sub-ring { width: 130px; height: 130px; border-radius: 50%; margin: 4px auto 0; display: grid; place-items: center; background: conic-gradient(var(--primary-indigo) var(--usage), rgba(255,255,255,0.06) 0); flex-shrink: 0; }
        .sd-sub-ring-inner { width: 96px; height: 96px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-space); }
        .sd-sub-ring-inner strong { font-size: 1.6rem; line-height: 1; }
        .sd-sub-ring-inner span { color: var(--text-muted); font-size: 0.72rem; }
        .sd-sub-info { display: flex; flex-direction: column; gap: 6px; }
        .sd-sub-info p { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0; }

        .sd-active-order { display: flex; flex-direction: column; gap: 12px; }
        .sd-active-order-details { display: flex; flex-direction: column; gap: 8px; }
        .sd-aod-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px; font-size: 0.85rem; }
        .sd-aod-row span { color: var(--text-muted); }
        .sd-aod-row strong { color: var(--text-primary); font-weight: 700; }
        .sd-pickup-code-section { text-align: center; padding: 16px; border: 1px dashed var(--border-active); border-radius: 12px; background: rgba(139,92,246,0.06); }
        .sd-pickup-code-large { font-size: 2rem; letter-spacing: 0.08em; font-weight: 900; color: var(--primary-indigo); display: block; margin-top: 4px; }

        .sd-tracking-section { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; align-items: start; }

        .sd-timeline { display: flex; flex-direction: column; gap: 0; position: relative; }
        .sd-tl-step { display: flex; gap: 14px; position: relative; }
        .sd-tl-line { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
        .sd-tl-dot { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; z-index: 1; transition: all var(--transition-normal); }
        .sd-tl-dot.dot-completed { background: rgba(52,211,153,0.18); color: #34d399; border: 2px solid #34d399; }
        .sd-tl-dot.dot-current { background: rgba(139,92,246,0.2); color: var(--primary-indigo); border: 2px solid var(--primary-indigo); box-shadow: 0 0 12px rgba(139,92,246,0.5), 0 0 24px rgba(139,92,246,0.25); animation: tl-glow 1.5s ease-in-out infinite alternate; }
        .sd-tl-dot.dot-future { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 2px solid var(--border-glass); }
        .sd-tl-connector { width: 2px; flex: 1; min-height: 28px; background: var(--border-glass); margin: 2px 0; }
        .sd-tl-connector.connector-done { background: #34d399; }
        .sd-tl-content { padding-bottom: 20px; flex: 1; }
        .sd-tl-content strong { font-size: 0.88rem; display: block; margin-bottom: 2px; }
        .sd-tl-content p { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
        .sd-tl-time { font-size: 0.7rem; color: var(--text-secondary); display: block; margin-top: 4px; }
        .sd-tl-step.future .sd-tl-content { opacity: 0.4; }
        .sd-tl-step.current .sd-tl-content strong { color: var(--primary-indigo); }
        .sd-tl-active-count { margin-top: 4px; padding-left: 42px; }

        @keyframes tl-glow {
          from { box-shadow: 0 0 8px rgba(139,92,246,0.4), 0 0 16px rgba(139,92,246,0.2); }
          to { box-shadow: 0 0 16px rgba(139,92,246,0.6), 0 0 32px rgba(139,92,246,0.3); }
        }

        .sd-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .sd-action-btn { text-align: left; cursor: pointer; padding: 12px; border: 1px solid var(--border-glass); border-radius: 12px; background: rgba(255,255,255,0.04); color: var(--text-primary); display: flex; flex-direction: column; gap: 4px; transition: border-color var(--transition-fast), transform var(--transition-fast); text-decoration: none; }
        .sd-action-btn:hover { border-color: var(--border-active); transform: translateY(-1px); }
        .sd-action-btn span { color: var(--text-muted); font-size: 0.75rem; line-height: 1.3; }

        @media (max-width: 960px) { .sd-hero, .sd-main-grid, .sd-tracking-section { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .sd-hero { padding: 16px; }
          .sd-hero-metrics { grid-template-columns: repeat(2, 1fr); }
          .sd-actions-grid { grid-template-columns: 1fr; }
          .sd-pickup-code-large { font-size: 1.5rem; }
          .sd-tl-dot { width: 18px; height: 18px; font-size: 0.6rem; }
          .sd-tl-content strong { font-size: 0.82rem; }
          .sd-tl-content p { font-size: 0.72rem; }
          .sd-tl-content { padding-bottom: 14px; }
        }
        @media (max-width: 375px) {
          .sd-hero-metrics { grid-template-columns: 1fr 1fr; }
          .sd-hero { padding: 12px; }
        }
      `}</style>
    </div>
  );
}
