"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Select from "@/components/Select";
import { getSlotOptions, getSlotLabel } from "@/lib/slots";

const statusOrder = ["SUBMITTED", "ACCEPTED", "PRINTING", "READY", "COLLECTED"];
const nextStatus: Record<string, string> = {
  SUBMITTED: "ACCEPTED",
  ACCEPTED: "PRINTING",
  PRINTING: "READY",
  READY: "COLLECTED",
};
const statusAction: Record<string, string> = {
  SUBMITTED: "Accept",
  ACCEPTED: "Print",
  PRINTING: "Ready",
  READY: "Collect",
};

const slotOptions = getSlotOptions();

export default function AdminOrdersClient({ orders }: { orders: any[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [slotFilter, setSlotFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [localOrders, setLocalOrders] = useState(orders);

  const filteredOrders = useMemo(() => {
    return localOrders.filter((o) => {
      const ms = statusFilter === "all" || o.status === statusFilter;
      const ss = slotFilter === "all" || o.pickupSlot === slotFilter;
      const text = `${o.fileName} ${o.user.name} ${o.user.email}`.toLowerCase();
      const mq = text.includes(search.toLowerCase());
      return ms && ss && mq;
    });
  }, [localOrders, statusFilter, slotFilter, search]);

  const updateStatus = async (order: any) => {
    const status = nextStatus[order.status];
    if (!status) return;
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(`Order moved to ${status}.`);
      setLocalOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    }
  };

  const statusCounts = statusOrder.reduce(
    (acc, s) => {
      acc[s] = localOrders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Orders</span>
        <h1 className="page-title">All print orders</h1>
      </div>

      <div className="glass-card">
        <div className="ad-filters" style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            placeholder="Search by file or student name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All statuses" },
              ...statusOrder.map((s) => ({ value: s, label: s })),
            ]}
            style={{ maxWidth: 180 }}
          />
          <Select
            value={slotFilter}
            onChange={setSlotFilter}
            options={[
              { value: "all", label: "All slots" },
              ...slotOptions,
            ]}
            style={{ maxWidth: 220 }}
          />
        </div>

        <div className="ad-queue-counts" style={{ marginBottom: 16 }}>
          {statusOrder.map((s) => (
            <span className={`status-badge status-${s}`} key={s}>
              {s}: {statusCounts[s]}
            </span>
          ))}
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Document</th>
                <th>Pages</th>
                <th>Print</th>
                <th>Pickup</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.user.name}</strong>
                    <small>{o.user.email}</small>
                  </td>
                  <td>
                    <a href={o.filePath} target="_blank" rel="noopener noreferrer">
                      {o.fileName}
                    </a>
                  </td>
                  <td>
                    {o.pages} × {o.copies}
                  </td>
                  <td>
                    {o.printMode === "COLOR" ? "Color" : "B&W"} /{" "}
                    {o.printSide === "DOUBLE" ? "Double" : "Single"}
                  </td>
                  <td>
                    {o.pickupDate
                      ? new Date(o.pickupDate).toLocaleDateString()
                      : "—"}
                    <small>{getSlotLabel(o.pickupSlot)}</small>
                  </td>
                  <td>
                    <span className={`status-badge status-${o.status}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === "COLLECTED" || o.status === "CANCELLED" ? (
                      <span className="text-muted text-sm">Done</span>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateStatus(o)}
                        type="button"
                      >
                        {statusAction[o.status] || "Next"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state compact">
                      <p>No orders match the filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .btn-sm { min-height: 30px; padding: 5px 10px; border-radius: 8px; font-size: 0.78rem; }
        .ad-filters { display: flex; gap: 10px; align-items: center; }
        .ad-queue-counts { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 860px) { .ad-filters { flex-direction: column; align-items: stretch; } }
      `}</style>
    </div>
  );
}
