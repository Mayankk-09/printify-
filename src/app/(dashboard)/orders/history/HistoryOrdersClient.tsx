"use client";

import { useState, useMemo } from "react";
import { getSlotLabel } from "@/lib/slots";
import Select from "@/components/Select";

const statusLabels: Record<string, string> = {
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
};

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "COLLECTED", label: "Collected" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryOrdersClient({ orders: initialOrders }: { orders: any[] }) {
  const [orders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");

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

  return (
    <div className="ho fade-in">
      <div className="ho-head">
        <div>
          <span className="eyebrow">Orders</span>
          <h1 className="page-title">Order History</h1>
          <p className="text-secondary">Completed and cancelled print jobs</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="ho-filters">
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
          <>
            {/* Desktop table */}
            <div className="ho-table-wrap">
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Pages</th>
                      <th>Copies</th>
                      <th>Type</th>
                      <th>Pickup slot</th>
                      <th>Ordered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o: any) => (
                      <tr key={o.id}>
                        <td>
                          <a href={o.filePath} target="_blank" rel="noopener noreferrer">
                            {o.fileName}
                          </a>
                        </td>
                        <td>{o.pages}</td>
                        <td>{o.copies}</td>
                        <td>
                          <small>{o.printMode === "COLOR" ? "Color" : "B&W"} / {o.printSide === "DOUBLE" ? "Double" : "Single"}</small>
                        </td>
                        <td>
                          <small>{getSlotLabel(o.pickupSlot) || "—"}</small>
                        </td>
                        <td>
                          <small>{formatDate(o.createdAt)}</small>
                        </td>
                        <td>
                          <span className={`status-badge status-${o.status}`}>
                            {statusLabels[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="ho-mobile-cards">
              {filteredOrders.map((o: any) => (
                <div key={o.id} className="glass-card ho-mobile-card">
                  <div className="ho-mc-head">
                    <div>
                      <strong>{o.fileName}</strong>
                      <span className="text-muted text-sm">{o.pages}p × {o.copies}c</span>
                    </div>
                    <span className={`status-badge status-${o.status}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </div>
                  <div className="ho-mc-body">
                    <div className="ho-mc-row"><span>Type</span><span>{o.printMode === "COLOR" ? "Color" : "B&W"} / {o.printSide === "DOUBLE" ? "Double" : "Single"}</span></div>
                    <div className="ho-mc-row"><span>Pickup</span><span>{getSlotLabel(o.pickupSlot) || "—"}</span></div>
                    <div className="ho-mc-row"><span>Ordered</span><span>{formatDate(o.createdAt)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No order history</h3>
            <p>Completed and cancelled orders will appear here.</p>
          </div>
        )}
      </div>

      <style>{`
        .ho { display: flex; flex-direction: column; gap: 16px; }
        .ho-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .ho-head p { margin-top: 4px; }
        .ho-filters { display: grid; grid-template-columns: 1fr 140px 160px; gap: 10px; margin-bottom: 16px; }
        .ho-mobile-cards { display: none; flex-direction: column; gap: 12px; }
        .ho-mobile-card { padding: 16px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .ho-mobile-card:active { transform: scale(0.99); }
        .ho-mc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .ho-mc-head div { display: flex; flex-direction: column; }
        .ho-mc-body { display: grid; gap: 6px; }
        .ho-mc-row { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; }
        .ho-mc-row span:first-child { color: var(--text-muted); }
        @media (max-width: 768px) { .ho-filters { grid-template-columns: 1fr; } .ho-table-wrap { display: none; } .ho-mobile-cards { display: flex; } }
        @media (max-width: 375px) { .ho-head { flex-direction: column; } }
      `}</style>
    </div>
  );
}
