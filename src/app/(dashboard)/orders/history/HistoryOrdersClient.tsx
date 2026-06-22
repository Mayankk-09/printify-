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
        @media (max-width: 768px) { .ho-filters { grid-template-columns: 1fr; } }
        @media (max-width: 375px) { .ho-head { flex-direction: column; } }
      `}</style>
    </div>
  );
}
