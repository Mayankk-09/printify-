"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [editingAddon, setEditingAddon] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    displayOrder: "",
    active: true,
  });

  useEffect(() => {
    fetch("/api/addons")
      .then((r) => r.json())
      .then(setAddons);
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", displayOrder: "", active: true });
    setEditingAddon(null);
  };

  const openEdit = (addon: any) => {
    setForm({
      name: addon.name,
      description: addon.description || "",
      price: String(addon.price),
      displayOrder: String(addon.displayOrder),
      active: addon.active,
    });
    setEditingAddon(addon);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        displayOrder: Number(form.displayOrder),
      };
      let res;
      if (editingAddon) {
        res = await fetch("/api/addons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingAddon.id, ...payload }),
        });
      } else {
        res = await fetch("/api/addons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to save");
      toast.success(editingAddon ? "Add-on updated" : "Add-on created");
      setShowForm(false);
      resetForm();
      const updated = await fetch("/api/addons").then((r) => r.json());
      setAddons(updated);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (addon: any) => {
    if (!confirm(`Delete "${addon.name}"?`)) return;
    try {
      const res = await fetch("/api/addons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: addon.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Add-on deleted");
      setAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Packs &amp; Add-ons</span>
          <h1 className="page-title">Manage add-ons</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} type="button">
          + New add-on
        </button>
      </div>

      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addons.map((addon) => (
                <tr key={addon.id}>
                  <td><strong>{addon.name}</strong></td>
                  <td><span className="text-secondary text-sm">{addon.description || "-"}</span></td>
                  <td>{addon.price === 0 ? "FREE" : `₹${(addon.price / 100).toFixed(2)}`}</td>
                  <td>{addon.displayOrder}</td>
                  <td>
                    <span className={`status-badge ${addon.active ? "status-READY" : "status-SUBMITTED"}`}>
                      {addon.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(addon)} type="button">Edit</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(addon)} type="button" style={{ color: "var(--accent-red)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!addons.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state compact"><p>No add-ons yet.</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card" style={{ maxWidth: 480 }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 className="font-black">{editingAddon ? "Edit add-on" : "New add-on"}</h2>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)} type="button">✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="form-row grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Price (in paise, 0 = FREE)</label>
                <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Display order</label>
                <input className="form-input" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2" style={{ cursor: "pointer", marginBottom: 16 }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span className="text-sm">Active</span>
            </label>

            <button className="btn btn-primary w-100" onClick={handleSave} type="button">
              {editingAddon ? "Update add-on" : "Create add-on"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
