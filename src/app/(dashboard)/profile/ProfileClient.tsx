"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const remaining = (sub: any) => (sub?.pagesAllowed ?? 0) - (sub?.pagesUsed ?? 0);

export default function ProfileClient({ user, subscription }: { user: { name: string | null; email: string; phone: string | null; createdAt: Date }; subscription: any }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone?.replace("+91 ", "").replace("+91", "") || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = useCallback((): boolean => {
    const e: { name?: string; phone?: string } = {};
    const trimmed = name.trim();
    if (!trimmed) e.name = "Name cannot be empty.";
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) e.phone = "Enter exactly 10 digits.";
      else if (!/^\d{10}$/.test(digits)) e.phone = "Invalid phone number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, phone]);

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body: Record<string, string | null> = { name: name.trim() };
      body.phone = phone ? phone.replace(/\D/g, "") : null;
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("Profile updated!");
      setEditing(false);
      window.dispatchEvent(new Event("profile-updated"));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setPhone(user.phone?.replace("+91 ", "").replace("+91", "") || "");
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="pf fade-in">
      <div className="pf-head">
        <span className="eyebrow">Profile</span>
        <h1 className="page-title">Account</h1>
      </div>

      <div className="glass-card">
        <div className="pf-avatar">
          <span className="pf-avatar-letter">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
          <div>
            <h2>{user.name}</h2>
            <p className="text-secondary">Student</p>
          </div>
        </div>
        <div className="pf-details">
          <div className="pf-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="pf-row">
            <span>Phone</span>
            <strong>{user.phone || "Not set"}</strong>
          </div>
          <div className="pf-row">
            <span>Member since</span>
            <strong>{formatDate(user.createdAt)}</strong>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="pf-edit-head">
          <h3 className="pf-section-title" style={{ marginBottom: 0 }}>Edit Profile</h3>
          {!editing && (
            <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="pf-edit-form">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              {errors.name && <span className="pf-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="pf-phone-input">
                <span className="pf-phone-prefix">+91</span>
                <input
                  className="form-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {errors.phone && <span className="pf-error">{errors.phone}</span>}
            </div>
            <div className="pf-edit-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : "Save"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-secondary text-sm">Update your name and phone number.</p>
        )}
      </div>

      <div className="glass-card">
        <h3 className="pf-section-title">Current Pack</h3>
        {subscription ? (
          <div className="pf-pack">
            <div className="pf-pack-card">
              <span className="pf-pack-name">{subscription.pack?.name || "Pack"}</span>
              <div className="pf-pack-meta">
                <div className="pf-pack-stat">
                  <span>Pages remaining</span>
                  <strong className="pf-remaining">{remaining(subscription)}</strong>
                </div>
                <div className="pf-pack-stat">
                  <span>Total pages</span>
                  <strong>{subscription.pagesAllowed}</strong>
                </div>
                <div className="pf-pack-stat">
                  <span>Pages used</span>
                  <strong>{subscription.pagesUsed || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pf-no-pack">
            <p className="text-secondary text-sm">You don&apos;t have an active pack.</p>
            <Link href="/subscribe" className="btn btn-primary btn-sm">
              Buy a pack
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .pf { display: flex; flex-direction: column; gap: 16px; }
        .pf-head { margin-bottom: 4px; }
        .pf-section-title { font-size: 0.95rem; font-weight: 800; margin-bottom: 12px; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .pf-avatar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .pf-avatar-letter { width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center; background: var(--bg-black); color: #fff; font-weight: 900; font-size: 1.4rem; }
        .pf-avatar h2 { font-size: 1.1rem; font-weight: 800; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .pf-details { display: flex; flex-direction: column; gap: 12px; }
        .pf-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 10px; }
        .pf-row span { color: var(--text-muted); font-size: 0.85rem; }
        .pf-row strong { color: var(--text-primary); font-size: 0.9rem; }
        .pf-pack-card { display: flex; flex-direction: column; gap: 10px; border: 1px solid var(--border-primary); padding: 14px; }
        .pf-pack-name { font-weight: 800; font-size: 1rem; }
        .pf-pack-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .pf-pack-stat { display: flex; flex-direction: column; gap: 1px; }
        .pf-pack-stat span { font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em; }
        .pf-pack-stat strong { font-size: 1.1rem; font-family: var(--font-serif-alt); }
        .pf-no-pack { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .pf-edit-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .pf-edit-form { display: flex; flex-direction: column; gap: 14px; }
        .pf-phone-input { display: flex; align-items: stretch; }
        .pf-phone-prefix { display: flex; align-items: center; padding: 0 12px; background: var(--bg-elevated); border: 1px solid var(--border-primary); border-right: none; font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: var(--text-muted); white-space: nowrap; }
        .pf-phone-input .form-input { flex: 1; }
        .pf-error { color: #dc2626; font-size: 0.75rem; margin-top: 2px; }
        .pf-edit-actions { display: flex; gap: 8px; margin-top: 4px; }
        .pf-edit-actions .btn-sm { min-height: 36px; padding: 6px 16px; font-size: 0.78rem; }
      `}</style>
    </div>
  );
}
