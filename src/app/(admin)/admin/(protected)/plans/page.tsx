"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    monthlyPrice: "",
    pagesIncluded: "",
    supportsColor: false,
    validityDays: "",
    active: true,
    displayOrder: "",
  });

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPlans);
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      monthlyPrice: "",
      pagesIncluded: "",
      supportsColor: false,
      validityDays: "",
      active: true,
      displayOrder: "",
    });
    setEditingPlan(null);
  };

  const openEdit = (plan: any) => {
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      monthlyPrice: String(plan.monthlyPrice),
      pagesIncluded: String(plan.pagesIncluded),
      supportsColor: plan.supportsColor,
      validityDays: String(plan.validityDays),
      active: plan.active,
      displayOrder: String(plan.displayOrder),
    });
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans";
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthlyPrice: Number(form.monthlyPrice),
          pagesIncluded: Number(form.pagesIncluded),
          validityDays: Number(form.validityDays),
          displayOrder: Number(form.displayOrder),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save plan");
      toast.success(editingPlan ? "Plan updated" : "Plan created");
      setShowForm(false);
      resetForm();
      const updated = await fetch("/api/plans").then((r) => r.json());
      setPlans(updated);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (plan: any) => {
    if (!confirm(`Delete "${plan.name}"?`)) return;
    try {
      const res = await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Plan deleted");
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Plans</span>
          <h1 className="page-title">Subscription plans</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} type="button">
          + New plan
        </button>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`glass-card plan-card ${!plan.active ? "inactive" : ""}`}>
            <div className="plan-card-header">
              <h2>{plan.name}</h2>
              <span className={`status-badge ${plan.active ? "status-READY" : "status-SUBMITTED"}`}>
                {plan.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="plan-price">₹{plan.monthlyPrice}<span>/month</span></div>
            <div className="plan-pages">{plan.pagesIncluded} pages</div>
            {plan.description && <p className="text-secondary text-sm">{plan.description}</p>}
            <div className="plan-features">
              <span>{plan.supportsColor ? "✓ Color supported" : "✗ B&W only"}</span>
              <span>{plan.validityDays} days validity</span>
            </div>
            <div className="plan-actions" style={{ marginTop: "auto", display: "flex", gap: 8 }}>
              <button className="btn btn-secondary w-100" onClick={() => openEdit(plan)} type="button">Edit</button>
              <button className="btn btn-secondary w-100" onClick={() => handleDelete(plan)} type="button" style={{ color: "var(--accent-red)" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 className="font-black">{editingPlan ? "Edit plan" : "New plan"}</h2>
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
                <label className="form-label">Price (₹/month)</label>
                <input className="form-input" type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pages included</label>
                <input className="form-input" type="number" value={form.pagesIncluded} onChange={(e) => setForm({ ...form, pagesIncluded: e.target.value })} />
              </div>
            </div>
            <div className="form-row grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Validity (days)</label>
                <input className="form-input" type="number" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Display order</label>
                <input className="form-input" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
            </div>
            <div className="form-row grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
              <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
                <input type="checkbox" checked={form.supportsColor} onChange={(e) => setForm({ ...form, supportsColor: e.target.checked })} />
                <span className="text-sm">Supports color</span>
              </label>
              <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <button className="btn btn-primary w-100" onClick={handleSave} type="button">
              {editingPlan ? "Update plan" : "Create plan"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .plan-card { display: flex; flex-direction: column; gap: 12px; }
        .plan-card.inactive { opacity: 0.6; }
        .plan-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .plan-card-header h2 { font-size: 1.1rem; font-weight: 800; }
        .plan-price { font-size: 2rem; font-weight: 800; }
        .plan-price span { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; }
        .plan-pages { font-size: 1rem; color: var(--accent-cyan); font-weight: 700; }
        .plan-features { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; color: var(--text-secondary); }
        @media (max-width: 860px) { .plans-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
