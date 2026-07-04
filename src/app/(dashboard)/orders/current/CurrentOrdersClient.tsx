"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getSlotLabel } from "@/lib/slots";
import Select from "@/components/Select";

const statusSteps = ["SUBMITTED", "ACCEPTED", "PRINTING", "READY", "COLLECTED"];
const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  PRINTING: "Printing",
  READY: "Ready for Pickup",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
};
const statusDescriptions: Record<string, string> = {
  SUBMITTED: "Your document has been received",
  ACCEPTED: "Your order has been reviewed and accepted",
  PRINTING: "Your document is being printed",
  READY: "Ready for pickup at the print room",
};

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PRINTING", label: "Printing" },
  { value: "READY", label: "Ready for Pickup" },
];

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

export default function CurrentOrdersClient({ orders: initialOrders }: { orders: any[] }) {
  const [orders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const sf = statusFilter === "all" || o.status === statusFilter;
      const ss = o.fileName.toLowerCase().includes(search.toLowerCase());
      let sd = true;
      if (dateRange) {
        const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
        sd = orderDate === dateRange;
      }
      return sf && ss && sd;
    });
  }, [orders, statusFilter, search, dateRange]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  return (
    <div className="co fade-in">
      <div className="co-head">
        <div>
          <span className="eyebrow">Orders</span>
          <h1 className="page-title">Current Orders</h1>
          <p className="text-secondary">Active print jobs in progress</p>
        </div>
        <Link href="/upload" className="btn btn-primary">
          ↑ Upload document
        </Link>
      </div>

      <div className="co-status-bar">
        {[
          ["SUBMITTED", "#94a3b8"],
          ["ACCEPTED", "#60a5fa"],
          ["PRINTING", "#fbbf24"],
          ["READY", "#34d399"],
        ].map(([status, color]) => (
          <div key={status} className="co-status-chip" style={{ "--chip-color": color } as React.CSSProperties}>
            <span className="co-status-dot" />
            <span className="co-status-label">{statusLabels[status]}</span>
            <span className="co-status-count">{statusCounts[status] || 0}</span>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <div className="co-filters">
          <input
            className="form-input"
            placeholder="Search by file name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusFilterOptions}
          />
          <input
            className="form-input"
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
        </div>

        {filteredOrders.length ? (
          <div className="co-orders-list">
            {filteredOrders.map((o: any) => {
              const currentIndex = getStatusIndex(o.status);
              const isExpanded = expandedOrder === o.id;

              return (
                <div key={o.id} className={`co-order-card glass-card ${isExpanded ? "expanded" : ""}`}>
                  <div className="co-order-header" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                    <div className="co-order-info">
                      <strong className="co-order-name">{o.fileName}</strong>
                      <div className="co-order-meta">
                        <span>{o.pages}p × {o.copies}c</span>
                        <span>{o.printMode === "COLOR" ? "Color" : "B&W"} / {o.printSide === "DOUBLE" ? "Double" : "Single"}</span>
                      </div>
                    </div>
                    <div className="co-order-right">
                      <span className={`status-badge status-${o.status}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                      <span className="co-expand-icon">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="co-order-body">
                      <div className="co-order-details">
                        <div className="co-detail-row">
                          <span>Pickup slot</span>
                          <strong>{getSlotLabel(o.pickupSlot) || "—"}</strong>
                        </div>
                        <div className="co-detail-row">
                          <span>Pickup code</span>
                          <strong className="co-code">{getPickupCode(o)}</strong>
                        </div>
                        <div className="co-detail-row">
                          <span>Submitted</span>
                          <strong>{formatDate(o.createdAt)}</strong>
                        </div>
                      </div>

                      <div className="co-timeline">
                        {statusSteps.slice(0, 4).map((step, i) => {
                          const isCompleted = i < currentIndex;
                          const isCurrent = i === currentIndex;
                          const isFuture = i > currentIndex;
                          const timestamp = getStatusTimestamp(o, step);

                          return (
                            <div key={step} className={`co-tl-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isFuture ? "future" : ""}`}>
                              <div className="co-tl-line">
                                <div className={`co-tl-dot ${isCompleted ? "dot-completed" : ""} ${isCurrent ? "dot-current" : ""} ${isFuture ? "dot-future" : ""}`}>
                                  {isCompleted ? "✓" : isCurrent ? "●" : "○"}
                                </div>
                                {i < 3 && <div className={`co-tl-connector ${isCompleted ? "connector-done" : ""}`} />}
                              </div>
                              <div className="co-tl-content">
                                <strong>{statusLabels[step]}</strong>
                                <p>{statusDescriptions[step]}</p>
                                {timestamp && (
                                  <span className="co-tl-time">{formatDate(timestamp)} at {formatTime(timestamp)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No current orders</h3>
            <p>All print jobs have been completed. Upload a new document to get started.</p>
            <Link href="/upload" className="btn btn-primary">
              Upload document
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .co { display: flex; flex-direction: column; gap: 16px; }
        .co-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .co-head p { margin-top: 4px; }
        .co-status-bar { display: flex; gap: 10px; flex-wrap: wrap; }
        .co-status-chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-glass); border-radius: 999px; padding: 6px 12px; background: rgba(255,255,255,0.04); font-size: 0.82rem; }
        .co-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--chip-color, #94a3b8); }
        .co-status-label { font-weight: 600; color: var(--text-primary); }
        .co-status-count { font-weight: 800; color: var(--text-muted); font-size: 0.82rem; }
        .co-filters { display: grid; grid-template-columns: 1fr 140px 160px; gap: 10px; margin-bottom: 16px; }
        .co-code { font-family: monospace; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.04em; color: var(--accent-cyan); }

        .co-orders-list { display: flex; flex-direction: column; gap: 8px; }
        .co-order-card { padding: 0; overflow: hidden; border: 1px solid var(--border-glass); }
        .co-order-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; cursor: pointer; transition: background var(--transition-fast); }
        .co-order-header:hover { background: rgba(255,255,255,0.04); }
        .co-order-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .co-order-name { font-size: 0.92rem; font-weight: 700; word-break: break-word; }
        .co-order-meta { display: flex; gap: 12px; font-size: 0.78rem; color: var(--text-muted); }
        .co-order-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .co-expand-icon { color: var(--text-muted); font-size: 0.75rem; }
        .co-order-body { border-top: 1px solid var(--border-glass); padding: 16px; }
        .co-order-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .co-detail-row { display: flex; flex-direction: column; gap: 2px; }
        .co-detail-row span { color: var(--text-muted); font-size: 0.72rem; }
        .co-detail-row strong { font-size: 0.85rem; }

        .co-timeline { display: flex; flex-direction: column; gap: 0; }
        .co-tl-step { display: flex; gap: 14px; }
        .co-tl-line { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
        .co-tl-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; flex-shrink: 0; z-index: 1; }
        .co-tl-dot.dot-completed { background: rgba(52,211,153,0.18); color: #34d399; border: 2px solid #34d399; }
        .co-tl-dot.dot-current { background: rgba(139,92,246,0.2); color: var(--primary-indigo); border: 2px solid var(--primary-indigo); box-shadow: 0 0 12px rgba(139,92,246,0.5), 0 0 24px rgba(139,92,246,0.25); animation: tl-glow 1.5s ease-in-out infinite alternate; }
        .co-tl-dot.dot-future { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 2px solid var(--border-glass); }
        .co-tl-connector { width: 2px; flex: 1; min-height: 24px; background: var(--border-glass); margin: 2px 0; }
        .co-tl-connector.connector-done { background: #34d399; }
        .co-tl-content { padding-bottom: 16px; flex: 1; }
        .co-tl-content strong { font-size: 0.82rem; display: block; margin-bottom: 1px; }
        .co-tl-content p { font-size: 0.72rem; color: var(--text-muted); margin: 0; }
        .co-tl-time { font-size: 0.65rem; color: var(--text-secondary); display: block; margin-top: 2px; }
        .co-tl-step.future .co-tl-content { opacity: 0.4; }
        .co-tl-step.current .co-tl-content strong { color: var(--primary-indigo); }

        @keyframes tl-glow {
          from { box-shadow: 0 0 8px rgba(139,92,246,0.4), 0 0 16px rgba(139,92,246,0.2); }
          to { box-shadow: 0 0 16px rgba(139,92,246,0.6), 0 0 32px rgba(139,92,246,0.3); }
        }

        @media (max-width: 768px) {
          .co-filters { grid-template-columns: 1fr; }
          .co-head { flex-direction: column; }
          .co-status-bar { gap: 6px; }
          .co-status-chip { font-size: 0.75rem; padding: 4px 10px; }
          .co-order-details { grid-template-columns: 1fr; }
        }
        @media (max-width: 375px) {
          .co-status-bar { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
