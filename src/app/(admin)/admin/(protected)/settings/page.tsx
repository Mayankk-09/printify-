"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const defaultSettings = {
  pagePriceBW: "500",
  pagePriceColor: "1000",
  maxFileSize: "15728640",
  allowedFileTypes: "pdf,doc,docx,ppt,pptx",
  trialMaxPages: "5",
};

const settingLabels: Record<string, string> = {
  pagePriceBW: "B&W Page Price (paise, default 500 = ₹5)",
  pagePriceColor: "Color Page Price (paise, default 1000 = ₹10)",
  maxFileSize: "Max File Size (bytes, default 15728640 = 15MB)",
  allowedFileTypes: "Allowed File Types (comma separated)",
  trialMaxPages: "Trial Max Pages (default 5)",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const [pickupSettings, setPickupSettings] = useState({
    cutoffTime: "14:00",
    maxAdvanceDays: 7,
    workingDays: "1,2,3,4,5,6",
    slots: "09:00-10:40,10:40-12:20,12:20-14:00,14:00-15:40,15:40-17:20",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const merged: Record<string, string> = { ...defaultSettings };
          data.settings.forEach((s: { key: string; value: string }) => {
            merged[s.key] = s.value;
          });
          setSettings(merged);
        }
        if (data.pickupSetting) {
          setPickupSettings({
            cutoffTime: data.pickupSetting.cutoffTime,
            maxAdvanceDays: data.pickupSetting.maxAdvanceDays,
            workingDays: data.pickupSetting.workingDays,
            slots: data.pickupSetting.slots,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          pickupSettings,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Settings</span>
        <h1 className="page-title">Platform settings</h1>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400 }} />
      ) : (
        <>
          <div className="glass-card" style={{ marginBottom: 20 }}>
            <h2 className="font-black" style={{ marginBottom: 16, fontSize: "1.1rem" }}>Pricing &amp; Limits</h2>
            <div className="settings-grid">
              {Object.entries(settingLabels).map(([key, label]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    value={settings[key] || ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: 20 }}>
            <h2 className="font-black" style={{ marginBottom: 16, fontSize: "1.1rem" }}>Pickup Settings</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label">Cutoff Time (HH:MM, 24h)</label>
                <input
                  className="form-input"
                  value={pickupSettings.cutoffTime}
                  onChange={(e) => setPickupSettings({ ...pickupSettings, cutoffTime: e.target.value })}
                  placeholder="14:00"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Advance Booking (days)</label>
                <input
                  className="form-input"
                  type="number"
                  value={pickupSettings.maxAdvanceDays}
                  onChange={(e) => setPickupSettings({ ...pickupSettings, maxAdvanceDays: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Working Days (0=Sun, 1=Mon, ..., comma separated)</label>
                <input
                  className="form-input"
                  value={pickupSettings.workingDays}
                  onChange={(e) => setPickupSettings({ ...pickupSettings, workingDays: e.target.value })}
                  placeholder="1,2,3,4,5,6"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pickup Slots (comma separated, format HH:MM-HH:MM)</label>
                <textarea
                  className="form-input"
                  value={pickupSettings.slots}
                  onChange={(e) => setPickupSettings({ ...pickupSettings, slots: e.target.value })}
                  rows={3}
                  placeholder="09:00-10:40,10:40-12:20,12:20-14:00,14:00-15:40,15:40-17:20"
                />
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSave} type="button">
            Save all settings
          </button>
        </>
      )}

      <style>{`
        .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 860px) { .settings-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
