"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const PACK_TYPES = [
  { value: "BW_ONLY", label: "Black & White Only" },
  { value: "BW_AND_COLOR", label: "Black & White + Color" },
];

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    pages: "",
    packType: "BW_AND_COLOR",
    active: true,
    displayOrder: "",
  });

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPacks);
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      pages: "",
      packType: "BW_AND_COLOR",
      active: true,
      displayOrder: "",
    });
    setEditingPack(null);
  };

  const openEdit = (pack: any) => {
    setForm({
      name: pack.name,
      slug: pack.slug,
      description: pack.description || "",
      price: String(pack.price),
      pages: String(pack.pages),
      packType: pack.packType,
      active: pack.active,
      displayOrder: String(pack.displayOrder),
    });
    setEditingPack(pack);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const url = editingPack ? `/api/plans/${editingPack.id}` : "/api/plans";
      const method = editingPack ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          pages: Number(form.pages),
          displayOrder: Number(form.displayOrder),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to save pack");
      toast.success(editingPack ? "Pack updated" : "Pack created");
      setShowForm(false);
      resetForm();
      const updated = await fetch("/api/plans").then((r) => r.json());
      setPacks(updated);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (pack: any) => {
    if (!confirm(`Delete "${pack.name}"? This will remove all associated subscriptions.`)) return;
    try {
      const res = await fetch(`/api/plans/${pack.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Pack deleted");
      setPacks((prev) => prev.filter((p) => p.id !== pack.id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Packs &amp; Add-ons</span>
          <h1 className="page-title">Manage page packs</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} type="button">
          + New pack
        </button>
      </div>

      <div className="plans-grid">
        {packs.map((pack) => (
          <div key={pack.id} className={`glass-card plan-card ${!pack.active ? "inactive" : ""}`}>
            <div className="plan-card-header">
              <h2>{pack.name}</h2>
              <span className={`status-badge ${pack.active ? "status-READY" : "status-SUBMITTED"}`}>
                {pack.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="plan-price">₹{(pack.price / 100).toFixed(2)}</div>
            <div className="plan-pages">{pack.pages} pages</div>
            <div className="plan-type-badge">
              {pack.packType === "BW_ONLY" ? "B&W Only" : "B&W + Color"}
            </div>
            {pack.description && <p className="text-secondary text-sm">{pack.description}</p>}
            <div className="plan-features">
              <span>₹{(pack.price / 100 / pack.pages).toFixed(2)} per page</span>
              <span>No expiry</span>
            </div>
            <div className="plan-actions" style={{ marginTop: "auto", display: "flex", gap: 8 }}>
              <button className="btn btn-secondary w-100" onClick={() => openEdit(pack)} type="button">Edit</button>
              <button className="btn btn-secondary w-100" onClick={() => handleDelete(pack)} type="button">Delete</button>
            </div>
          </div>
        ))}
        {!packs.length && (
          <div className="glass-card" style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center" }}>
            <p className="text-secondary">No packs yet. Create your first pack.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 className="font-black">{editingPack ? "Edit pack" : "New pack"}</h2>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)} type="button">✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="form-row grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Price (in paise, e.g., 24900 = ₹249)</label>
                <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pages</label>
                <input className="form-input" type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Print Type</label>
              <select className="form-input" value={form.packType} onChange={(e) => setForm({ ...form, packType: e.target.value })}>
                {PACK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Display order</label>
                <input className="form-input" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
              <label className="flex items-center gap-2" style={{ cursor: "pointer", marginBottom: 14, marginTop: 24 }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <button className="btn btn-primary w-100" onClick={handleSave} type="button">
              {editingPack ? "Update pack" : "Create pack"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .plan-card { display: flex; flex-direction: column; gap: 12px; padding: 20px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .plan-card:active { transform: scale(0.99); }
        .plan-card.inactive { opacity: 0.6; }
        .plan-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .plan-card-header h2 { font-size: 1.1rem; font-weight: 800; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .plan-price { font-size: 2rem; font-weight: 800; font-family: var(--font-serif-alt); letter-spacing: -0.03em; }
        .plan-pages { font-size: 1rem; font-weight: 700; font-family: var(--font-mono); }
        .plan-type-badge { display: inline-flex; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border: 1px solid var(--border-primary); font-family: var(--font-mono); width: fit-content; text-transform: uppercase; letter-spacing: 0.04em; }
        .plan-features { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; color: var(--text-secondary); }
        @media (max-width: 860px) { .plans-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
