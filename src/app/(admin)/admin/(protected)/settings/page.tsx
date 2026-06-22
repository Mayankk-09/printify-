"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const defaultSettings: Record<string, string> = {
  bw_page_cost: "5",
  color_page_cost: "10",
  staple_cost: "2",
  punch_cost: "1",
  cobra_file_cost: "20",
  transparent_file_cost: "10",
  folder_cost: "15",
  max_file_size_mb: "15",
  allowed_file_types: "pdf,docx,pptx",
};

const settingLabels: Record<string, string> = {
  bw_page_cost: "B&W Page Cost (₹)",
  color_page_cost: "Color Page Cost (₹)",
  staple_cost: "Staple Cost (₹)",
  punch_cost: "Punch Cost (₹)",
  cobra_file_cost: "Cobra File Cost (₹)",
  transparent_file_cost: "Transparent File Cost (₹)",
  folder_cost: "Folder Cost (₹)",
  max_file_size_mb: "Max File Size (MB)",
  allowed_file_types: "Allowed File Types",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const merged = { ...defaultSettings };
          data.settings.forEach((s: any) => {
            merged[s.key] = s.value;
          });
          setSettings(merged);
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
        body: JSON.stringify({ settings }),
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

      <div className="glass-card">
        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : (
          <>
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
            <button className="btn btn-primary" onClick={handleSave} type="button" style={{ marginTop: 16 }}>
              Save settings
            </button>
          </>
        )}
      </div>

      <style>{`
        .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 860px) { .settings-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
