"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalyticsData, AnalyticsRange, AnalyticsBucket, ChartGranularity } from "@/lib/analytics";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatInteger(value: number): string {
  return value.toLocaleString("en-IN");
}

/** Formats a bucket key as a wall-clock label without any timezone shifting. */
function bucketLabel(key: string, granularity: ChartGranularity): string {
  if (granularity === "day") {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  const [datePart, hour] = key.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d, Number(hour)).toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });
}

function BarChart({
  buckets,
  granularity,
  formatter,
}: {
  buckets: AnalyticsBucket[];
  granularity: ChartGranularity;
  formatter: (value: number) => string;
}) {
  const max = buckets.reduce((m, b) => Math.max(m, b.value), 0);

  if (buckets.length === 0 || max === 0) {
    return <div className="aa-chart-empty">No data for this period</div>;
  }

  const labelStep = buckets.length > 16 ? Math.ceil(buckets.length / 8) : 1;

  return (
    <div className="aa-chart">
      <div className="aa-chart-max">
        Peak: <strong>{formatter(max)}</strong>
      </div>
      <div className="aa-bars">
        {buckets.map((b, i) => {
          const pct = Math.max((b.value / max) * 100, b.value > 0 ? 3 : 0);
          const label = bucketLabel(b.key, granularity);
          return (
            <div className="aa-bar-col" key={b.key} title={`${label} — ${formatter(b.value)}`}>
              <div className="aa-bar-track">
                {b.value > 0 && <div className="aa-bar-fill" style={{ height: `${pct}%` }} />}
              </div>
              <span className="aa-bar-label">{i % labelStep === 0 ? label : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsClient() {
  const [range, setRange] = useState<AnalyticsRange>("today");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (r: AnalyticsRange) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics?range=${encodeURIComponent(r)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load analytics");
      setData(json as AnalyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const totalRevenuePaise = data?.totalRevenuePaise ?? 0;
  const payPerPageRevenuePaise = data?.payPerPageRevenuePaise ?? 0;
  const packRevenuePaise = data?.packRevenuePaise ?? 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Analytics</span>
        <h1 className="page-title">Revenue &amp; usage</h1>
        <div className="aa-toolbar">
          <div className="aa-filter-tabs">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`aa-filter-btn ${range === opt.value ? "active" : ""}`}
                onClick={() => setRange(opt.value)}
                aria-pressed={range === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className={`aa-status ${loading ? "loading" : ""}`}>
            {loading ? "Updating…" : error ? "Error" : "Live"}
          </span>
        </div>
      </div>

      {error && (
        <div className="aa-error" role="alert">
          {error}
        </div>
      )}

      <div className="aa-stats-grid" style={{ marginBottom: 16 }}>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Total Orders</span>
          <strong className="aa-stat-value">{formatInteger(data?.totalOrders ?? 0)}</strong>
        </div>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Total Pages Printed</span>
          <strong className="aa-stat-value">{formatInteger(data?.totalPagesPrinted ?? 0)}</strong>
        </div>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Total Revenue Received</span>
          <strong className="aa-stat-value">{formatPaise(totalRevenuePaise)}</strong>
        </div>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Completed Orders</span>
          <strong className="aa-stat-value">{formatInteger(data?.completedOrders ?? 0)}</strong>
        </div>
      </div>

      <div className="aa-secondary-grid" style={{ marginBottom: 16 }}>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Revenue Breakdown</span>
          <div className="aa-breakdown">
            <div className="aa-breakdown-row">
              <span>Pay Per Page</span>
              <strong>{formatPaise(payPerPageRevenuePaise)}</strong>
            </div>
            <div className="aa-breakdown-row">
              <span>Pack Purchases</span>
              <strong>{formatPaise(packRevenuePaise)}</strong>
            </div>
            <div className="aa-breakdown-row aa-breakdown-total">
              <span>Total</span>
              <strong>{formatPaise(payPerPageRevenuePaise + packRevenuePaise)}</strong>
            </div>
          </div>
        </div>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Estimated Printing Cost</span>
          <strong className="aa-stat-value">{formatRupees(data?.estimatedPrintingCostRupees ?? 0)}</strong>
          <p className="aa-stat-hint">₹0.70 per printed page</p>
        </div>
        <div className="glass-card aa-stat-card">
          <span className="aa-stat-label">Estimated Profit</span>
          <strong className="aa-stat-value">{formatRupees(data?.estimatedProfitRupees ?? 0)}</strong>
          <p className="aa-stat-hint">Revenue − Printing cost</p>
        </div>
      </div>

      <div className="aa-charts-grid">
        <div className="glass-card aa-chart-card">
          <h2 className="aa-section-title">Revenue Chart</h2>
          <BarChart
            buckets={data?.revenueBuckets ?? []}
            granularity={data?.granularity ?? "day"}
            formatter={formatPaise}
          />
        </div>
        <div className="glass-card aa-chart-card">
          <h2 className="aa-section-title">Orders Chart</h2>
          <BarChart
            buckets={data?.ordersBuckets ?? []}
            granularity={data?.granularity ?? "day"}
            formatter={(v) => formatInteger(v)}
          />
        </div>
      </div>

      <style>{`
        .aa-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
        .aa-filter-tabs { display: inline-flex; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .aa-filter-btn { background: transparent; border: none; color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 8px 16px; cursor: pointer; transition: background var(--transition-fast), color var(--transition-fast); }
        .aa-filter-btn + .aa-filter-btn { border-left: 1px solid var(--border-primary); }
        .aa-filter-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
        .aa-filter-btn.active { background: var(--bg-black); color: #fff; }
        .aa-status { font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); display: inline-flex; align-items: center; gap: 6px; }
        .aa-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--border-secondary); }
        .aa-status.loading::before { background: var(--border-primary); animation: aa-pulse 0.8s ease-in-out infinite alternate; }
        @keyframes aa-pulse { from { opacity: 0.2; } to { opacity: 1; } }
        .aa-error { border: 1px solid var(--border-primary); border-left: 3px solid var(--text-primary); background: var(--bg-card); color: var(--text-secondary); padding: 12px 16px; margin-bottom: 16px; font-size: 0.85rem; }
        .aa-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .aa-secondary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .aa-stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .aa-stat-label { color: var(--text-muted); font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; font-family: var(--font-mono); }
        .aa-stat-value { font-size: 1.8rem; font-weight: 800; font-family: var(--font-serif-alt); letter-spacing: -0.03em; line-height: 1.1; }
        .aa-stat-hint { color: var(--text-muted); font-size: 0.72rem; font-family: var(--font-mono); margin: 0; }
        .aa-breakdown { display: grid; gap: 6px; margin-top: 4px; }
        .aa-breakdown-row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 0.85rem; }
        .aa-breakdown-row span { color: var(--text-secondary); }
        .aa-breakdown-row strong { font-family: var(--font-mono); font-size: 0.9rem; }
        .aa-breakdown-total { border-top: 1px solid var(--border-light); padding-top: 6px; }
        .aa-breakdown-total strong { font-weight: 800; }
        .aa-charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .aa-chart-card { padding: 20px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .aa-section-title { font-size: 1rem; font-weight: 800; margin-bottom: 16px; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .aa-chart-empty { color: var(--text-muted); font-size: 0.85rem; padding: 48px 0; text-align: center; border: 1px dashed var(--border-light); }
        .aa-chart-max { color: var(--text-muted); font-size: 0.72rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .aa-chart-max strong { color: var(--text-primary); }
        .aa-bars { display: flex; align-items: flex-end; gap: 3px; height: 200px; }
        .aa-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
        .aa-bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; background: var(--bg-elevated); border: 1px solid var(--border-light); border-bottom: none; min-height: 0; }
        .aa-bar-fill { width: 100%; background: var(--bg-black); min-height: 0; }
        .aa-bar-label { font-size: 0.58rem; color: var(--text-muted); font-family: var(--font-mono); white-space: nowrap; }
        @media (max-width: 960px) {
          .aa-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .aa-secondary-grid { grid-template-columns: 1fr; }
          .aa-charts-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .aa-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
