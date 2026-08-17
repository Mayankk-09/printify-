"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Select from "@/components/Select";
import { getSlotOptions, getSlotLabel } from "@/lib/slots";

const statusOrder = ["SUBMITTED", "ACCEPTED", "PRINTING", "READY", "COLLECTED", "CANCELLED"];
const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  PRINTING: "Printing",
  READY: "Ready",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
};
const nextStatus: Record<string, string> = {
  SUBMITTED: "ACCEPTED",
  ACCEPTED: "PRINTING",
  PRINTING: "READY",
  READY: "COLLECTED",
};
const statusAction: Record<string, string> = {
  SUBMITTED: "Accept",
  ACCEPTED: "Printing",
  PRINTING: "Ready",
  READY: "Collected",
};

const slotOptions = getSlotOptions();
const sortOptions = [
  { value: "submittedAt_desc", label: "Newest first" },
  { value: "submittedAt_asc", label: "Oldest first" },
  { value: "pickupDate_asc", label: "Earliest pickup first" },
  { value: "pickupDate_desc", label: "Latest pickup first" },
  { value: "status_asc", label: "Status A-Z" },
  { value: "status_desc", label: "Status Z-A" },
  { value: "userName_asc", label: "Student name A-Z" },
  { value: "userName_desc", label: "Student name Z-A" },
  { value: "pages_desc", label: "Most pages first" },
  { value: "pages_asc", label: "Least pages first" },
];

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  ...statusOrder.map((s) => ({ value: s, label: s })),
];

const printModeOptions = [
  { value: "all", label: "All modes" },
  { value: "BW", label: "B/W" },
  { value: "COLOR", label: "Color" },
];

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getPickupCode(order: any): string {
  if (order.pickupCode?.code) return order.pickupCode.code;
  return `P-${order.orderNumber?.slice(-4) || "0000"}`;
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [slotFilter, setSlotFilter] = useState("all");
  const [printModeFilter, setPrintModeFilter] = useState("all");
  const [sort, setSort] = useState("submittedAt_desc");
  const [pickupDateFrom, setPickupDateFrom] = useState("");
  const [pickupDateTo, setPickupDateTo] = useState("");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingPages, setEditingPages] = useState(false);
  const [correctedPages, setCorrectedPages] = useState<number>(0);
  const [openingFile, setOpeningFile] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (slotFilter !== "all") params.set("pickupSlot", slotFilter);
      if (printModeFilter !== "all") params.set("printMode", printModeFilter);
      if (pickupDateFrom) params.set("pickupDateFrom", pickupDateFrom);
      if (pickupDateTo) params.set("pickupDateTo", pickupDateTo);
      if (orderDateFrom) params.set("orderDateFrom", orderDateFrom);
      if (orderDateTo) params.set("orderDateTo", orderDateTo);
      const [sortBy, sortOrder] = sort.split("_");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data.orders);
      setStatusCounts(data.statusCounts ?? data.stats ?? {});
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, slotFilter, printModeFilter, sort, pickupDateFrom, pickupDateTo, orderDateFrom, orderDateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setCorrectedPages(order.pages);
    setEditingPages(false);
  };

  const savePageCount = async () => {
    if (!selectedOrder || correctedPages < 1) {
      toast.error("Page count must be at least 1.");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/pages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctedPages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update page count");
      toast.success(`Page count updated to ${correctedPages}.`);
      setEditingPages(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update page count");
    }
  };

  const openFile = async (storagePath: string) => {
    setOpeningFile(true);
    try {
      const res = await fetch(`/api/files/signed-url?path=${encodeURIComponent(storagePath)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load file");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast.error(err.message || "Unable to load file");
    } finally {
      setOpeningFile(false);
    }
  };

  const updateStatus = async (order: any, targetStatus?: string) => {
    const status = targetStatus || nextStatus[order.status];
    if (!status) return;
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(`Order moved to ${statusLabels[status] || status}.`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    }
  };

  return (
    <div className="ao fade-in">
      <div className="ao-head">
        <div>
          <span className="eyebrow">Orders</span>
          <h1 className="page-title">Order Management</h1>
          <p className="text-secondary">Manage, filter, and update print orders.</p>
        </div>
        <button
          className="btn btn-secondary btn-sm ao-filter-toggle"
          type="button"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide filters ▲" : "Filters ▼"}
        </button>
      </div>

      <div className="ao-queue">
        {statusOrder.map((s) => (
          <button
            key={s}
            className={`ao-queue-chip ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            type="button"
          >
            <span className={`status-badge status-${s}`}>{statusLabels[s] || s}</span>
            <span className="ao-queue-count">{statusCounts[s] || 0}</span>
          </button>
        ))}
      </div>

      <div className={`ao-filters-panel ${showFilters ? "open" : ""}`}>
        <div className="ao-filters-grid">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              className="form-input"
              placeholder="Name, email, or order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <Select value={statusFilter} onChange={setStatusFilter} options={statusFilterOptions} />
          </div>
          <div className="form-group">
            <label className="form-label">Sort by</label>
            <Select value={sort} onChange={setSort} options={sortOptions} />
          </div>
          <div className="form-group">
            <label className="form-label">Pickup slot</label>
            <Select value={slotFilter} onChange={setSlotFilter} options={[{ value: "all", label: "All slots" }, ...slotOptions]} />
          </div>
          <div className="form-group">
            <label className="form-label">Print mode</label>
            <Select value={printModeFilter} onChange={setPrintModeFilter} options={printModeOptions} />
          </div>
          <div className="form-group">
            <label className="form-label">Pickup date from</label>
            <input className="form-input" type="date" value={pickupDateFrom} onChange={(e) => setPickupDateFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Pickup date to</label>
            <input className="form-input" type="date" value={pickupDateTo} onChange={(e) => setPickupDateTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Order date from</label>
            <input className="form-input" type="date" value={orderDateFrom} onChange={(e) => setOrderDateFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Order date to</label>
            <input className="form-input" type="date" value={orderDateTo} onChange={(e) => setOrderDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Desktop table view */}
      <div className="ao-table-wrap">
        <div className="glass-card ao-table-card">
          {loading ? (
            <div className="empty-state compact"><p>Loading orders...</p></div>
          ) : orders.length === 0 ? (
            <div className="empty-state compact"><p>No orders match the filters.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Student</th>
                    <th>Pages</th>
                    <th>Pickup date</th>
                    <th>Slot</th>
                    <th>Order date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong className="ao-order-num">{o.orderNumber}</strong>
                        <small>{o.fileName || "—"}</small>
                        {o.orderAddons && o.orderAddons.length > 0 && (
                          <div className="ao-addon-tags">
                            {o.orderAddons.map((a: any) => (
                              <span key={a.id} className="ao-addon-tag ao-addon-tag--sm">{a.name}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{o.user.name}</strong>
                        <small>{o.user.email}</small>
                      </td>
                      <td>{o.pages} × {o.copies}</td>
                      <td>{formatDate(o.pickupDate)}</td>
                      <td><small>{getSlotLabel(o.pickupSlot)}</small></td>
                      <td><small>{formatDate(o.createdAt)}</small></td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {statusLabels[o.status] || o.status}
                        </span>
                      </td>
                      <td>
                        <div className="ao-actions">
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => openDetail(o)} title="View details">
                            👁
                          </button>
                          {o.status === "SUBMITTED" && (
                            <button className="btn btn-primary btn-sm" type="button" onClick={() => updateStatus(o)}>
                              Accept
                            </button>
                          )}
                          {o.status === "ACCEPTED" && (
                            <button className="btn btn-secondary btn-sm" type="button" onClick={() => updateStatus(o)}>
                              Printing
                            </button>
                          )}
                          {o.status === "PRINTING" && (
                            <button className="btn btn-secondary btn-sm" type="button" onClick={() => updateStatus(o)}>
                              Ready
                            </button>
                          )}
                          {o.status === "READY" && (
                            <button className="btn btn-secondary btn-sm" type="button" onClick={() => updateStatus(o)}>
                              Collect
                            </button>
                          )}
                          {o.status !== "COLLECTED" && o.status !== "CANCELLED" && (
                            <button className="btn btn-ghost btn-sm ao-cancel" type="button" onClick={() => updateStatus(o, "CANCELLED")}>
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mobile card view */}
      <div className="ao-mobile-cards">
        {loading ? (
          <div className="glass-card"><div className="empty-state compact"><p>Loading orders...</p></div></div>
        ) : orders.length === 0 ? (
          <div className="glass-card"><div className="empty-state compact"><p>No orders match the filters.</p></div></div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="glass-card ao-mobile-card">
              <div className="ao-mc-head">
                <strong className="ao-order-num">{o.orderNumber}</strong>
                <span className={`status-badge status-${o.status}`}>
                  {statusLabels[o.status] || o.status}
                </span>
              </div>
              <div className="ao-mc-body">
                <div className="ao-mc-row">
                  <span>Student</span>
                  <strong>{o.user.name}</strong>
                </div>
                <div className="ao-mc-row">
                  <span>File</span>
                  <span>{o.fileName || "—"}</span>
                </div>
                <div className="ao-mc-row">
                  <span>Pages</span>
                  <strong>{o.pages} × {o.copies}</strong>
                </div>
                <div className="ao-mc-row">
                  <span>Pickup</span>
                  <span>{formatDate(o.pickupDate)} {getSlotLabel(o.pickupSlot)}</span>
                </div>
                <div className="ao-mc-row">
                  <span>Ordered</span>
                  <span>{formatDate(o.createdAt)}</span>
                </div>
              </div>
              <div className="ao-mc-pickup">
                <span className="ao-mc-pickup-label">Pickup code</span>
                <strong className="ao-mc-pickup-code">{getPickupCode(o)}</strong>
              </div>
              <div className="ao-mc-actions">
                {o.status === "SUBMITTED" && (
                  <button className="btn btn-primary btn-sm w-100" type="button" onClick={() => updateStatus(o)}>
                    ✓ Accept
                  </button>
                )}
                {o.status === "ACCEPTED" && (
                  <button className="btn btn-secondary btn-sm w-100" type="button" onClick={() => updateStatus(o)}>
                    ▶ Printing
                  </button>
                )}
                {o.status === "PRINTING" && (
                  <button className="btn btn-secondary btn-sm w-100" type="button" onClick={() => updateStatus(o)}>
                    📦 Ready
                  </button>
                )}
                {o.status === "READY" && (
                  <button className="btn btn-secondary btn-sm w-100" type="button" onClick={() => updateStatus(o)}>
                    ✓ Collect
                  </button>
                )}
                {o.status !== "COLLECTED" && o.status !== "CANCELLED" && (
                  <button className="btn btn-ghost btn-sm ao-cancel" type="button" onClick={() => updateStatus(o, "CANCELLED")} style={{ position: "absolute", top: 8, right: 8, minHeight: "auto", padding: "2px 8px", fontSize: "0.7rem" }}>
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="glass-card modal-card ao-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <div>
                <span className="eyebrow">{selectedOrder.orderNumber}</span>
                <h2 className="font-black" style={{ marginTop: 4, fontSize: "1.15rem" }}>
                  {selectedOrder.fileName || "Document"}
                </h2>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedOrder(null)} type="button" style={{ width: 32, height: 32, padding: 0 }}>
                ✕
              </button>
            </div>

            <div className="ao-detail-grid">
              <div className="ao-detail-section">
                <h3>Student</h3>
                <p><strong>{selectedOrder.user.name}</strong></p>
                <p className="text-muted">{selectedOrder.user.email}</p>
                {selectedOrder.user.phone && <p className="text-muted">{selectedOrder.user.phone}</p>}
              </div>
              <div className="ao-detail-section">
                <h3>Document</h3>
                <p><strong>{selectedOrder.fileName || "Document removed (retention expired)"}</strong></p>
                {selectedOrder.orderAddons && selectedOrder.orderAddons.length > 0 && (
                  <div className="ao-addon-tags">
                    {selectedOrder.orderAddons.map((a: any) => (
                      <span key={a.id} className="ao-addon-tag">{a.name}</span>
                    ))}
                  </div>
                )}
                {selectedOrder.filePath && (
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    disabled={openingFile}
                    onClick={() => openFile(selectedOrder.filePath)}
                    style={{ fontSize: "0.75rem", padding: "4px 8px", minHeight: "auto", marginTop: 4, textDecoration: "underline", cursor: "pointer" }}
                  >
                    {openingFile ? "Loading..." : "View Document"}
                  </button>
                )}
                {selectedOrder.pageCountPending && (
                  <p className="text-warning" style={{ color: "#fbbf24", fontSize: "0.78rem" }}>
                    Page count pending — needs verification
                  </p>
                )}
                {!editingPages ? (
                  <p>
                    {selectedOrder.pages} pages × {selectedOrder.copies} copies

                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => { setCorrectedPages(selectedOrder.pages); setEditingPages(true); }}
                      style={{ marginLeft: 8, fontSize: "0.7rem", padding: "2px 6px", minHeight: "auto" }}
                      title="Edit Page Count"
                    >
                      Edit Pages
                    </button>
                  </p>
                ) : (
                  <div className="ao-page-edit">
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginRight: 6 }}>Current Pages: {selectedOrder.pages}</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                      <input
                        className="form-input"
                        type="number"
                        min={1}
                        value={correctedPages}
                        onChange={(e) => setCorrectedPages(parseInt(e.target.value) || 1)}
                        style={{ width: 80, padding: "4px 8px", fontSize: "0.82rem" }}
                      />
                      <button className="btn btn-primary btn-sm" type="button" onClick={savePageCount} style={{ fontSize: "0.72rem", padding: "4px 8px", minHeight: "auto" }}>
                        Save
                      </button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditingPages(false)} style={{ fontSize: "0.72rem", padding: "4px 8px", minHeight: "auto" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <p>{selectedOrder.printMode === "COLOR" ? "Color" : "B&W"} / {selectedOrder.printSide === "DOUBLE" ? "Double-sided" : "Single-sided"}</p>
              </div>
              <div className="ao-detail-section">
                <h3>Pickup</h3>
                <p><strong>{formatDate(selectedOrder.pickupDate)}</strong></p>
                <p>{getSlotLabel(selectedOrder.pickupSlot)}</p>
                {selectedOrder.pickupCode?.code && (
                  <p className="ao-pickup-code">Code: {selectedOrder.pickupCode.code}</p>
                )}
              </div>
              <div className="ao-detail-section">
                <h3>Status</h3>
                <span className={`status-badge status-${selectedOrder.status}`}>
                  {statusLabels[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="ao-detail-actions">
              {selectedOrder.status === "SUBMITTED" && (
                <button className="btn btn-primary" type="button" onClick={() => { updateStatus(selectedOrder); setSelectedOrder(null); }}>
                  Accept Order
                </button>
              )}
              {selectedOrder.status === "ACCEPTED" && (
                <button className="btn btn-secondary" type="button" onClick={() => { updateStatus(selectedOrder); setSelectedOrder(null); }}>
                  Start Printing
                </button>
              )}
              {selectedOrder.status === "PRINTING" && (
                <button className="btn btn-secondary" type="button" onClick={() => { updateStatus(selectedOrder); setSelectedOrder(null); }}>
                  Mark Ready
                </button>
              )}
              {selectedOrder.status === "READY" && (
                <button className="btn btn-secondary" type="button" onClick={() => { updateStatus(selectedOrder); setSelectedOrder(null); }}>
                  Mark Collected
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ao { display: flex; flex-direction: column; gap: 16px; }
        .ao-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .ao-head p { margin-top: 4px; }
        .ao-filter-toggle { flex-shrink: 0; }

        .ao-queue { display: flex; flex-wrap: wrap; gap: 8px; }
        .ao-queue-chip { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border-light); padding: 4px 8px 4px 4px; background: transparent; color: var(--text-primary); cursor: pointer; font: inherit; transition: border-color var(--transition-fast), background var(--transition-fast); }
        .ao-queue-chip:hover { border-color: var(--border-secondary); background: var(--bg-elevated); }
        .ao-queue-chip.active { border-color: var(--border-primary); background: var(--bg-black); color: #fff; }
        .ao-queue-chip.active .ao-queue-count { color: rgba(255,255,255,0.7); }
        .ao-queue-count { font-weight: 800; font-size: 0.85rem; min-width: 18px; text-align: center; font-family: var(--font-mono); }

        .ao-filters-panel { overflow: hidden; max-height: 0; transition: max-height 0.3s ease; }
        .ao-filters-panel.open { max-height: 600px; }
        .ao-filters-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 16px; background: var(--bg-card); border: 1px solid var(--border-primary); }
        .ao-filters-grid .form-group { margin-bottom: 0; }

        .ao-table-wrap { display: block; }
        .ao-table-card { padding: 0; overflow: hidden; }
        .ao-table-card .modern-table th, .ao-table-card .modern-table td { padding: 10px 8px; white-space: nowrap; }
        .ao-order-num { font-family: var(--font-mono); font-size: 0.82rem; letter-spacing: 0.03em; }
        .ao-actions { display: flex; gap: 4px; align-items: center; flex-wrap: nowrap; }
        .ao-actions .btn-sm { min-height: 28px; padding: 4px 8px; font-size: 0.72rem; }
        .ao-cancel { opacity: 0.5; }
        .ao-cancel:hover { opacity: 1; }

        .ao-mobile-cards { display: none; }

        .ao-mobile-card { display: flex; flex-direction: column; gap: 8px; position: relative; padding: 16px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .ao-mobile-card:active { transform: scale(0.99); }
        .ao-mc-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .ao-mc-body { display: grid; gap: 6px; }
        .ao-mc-row { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; }
        .ao-mc-row span:first-child { color: var(--text-muted); }
        .ao-mc-row strong { font-family: var(--font-mono); font-size: 0.85rem; }
        .ao-mc-pickup { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid var(--border-light); padding: 8px 12px; }
        .ao-mc-pickup-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em; }
        .ao-mc-pickup-code { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 900; letter-spacing: 0.08em; }
        .ao-mc-actions { display: flex; gap: 8px; margin-top: 4px; }

        .ao-detail-modal { max-width: 560px; background: var(--bg-card); border: 1px solid var(--border-primary); padding: 24px; }
        .ao-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
        .ao-detail-section { display: flex; flex-direction: column; gap: 4px; }
        .ao-detail-section h3 { font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; font-family: var(--font-mono); }
        .ao-detail-section p { font-size: 0.85rem; }
        .ao-pickup-code { font-weight: 700; font-family: var(--font-mono); letter-spacing: 0.04em; }
        .ao-detail-actions { display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border-light); padding-top: 16px; }
        .ao-page-edit strong { font-family: var(--font-mono); }
        .ao-addon-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
        .ao-addon-tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 600; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: var(--text-muted); letter-spacing: 0.02em; font-family: var(--font-mono); }
        .ao-addon-tag--sm { font-size: 0.62rem; padding: 1px 6px; }

        .btn-sm { min-height: 30px; padding: 5px 10px; font-size: 0.78rem; }

        @media (max-width: 1100px) {
          .ao-filters-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 860px) {
          .ao-filters-grid { grid-template-columns: repeat(2, 1fr); }
          .ao-head { flex-direction: column; }
        }

        @media (max-width: 768px) {
          .ao-table-wrap { display: none; }
          .ao-mobile-cards { display: flex; flex-direction: column; gap: 12px; }
          .ao-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
