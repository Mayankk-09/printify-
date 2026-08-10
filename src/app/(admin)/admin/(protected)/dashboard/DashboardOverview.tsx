"use client";

import { useAdminAnalytics } from "../admin-analytics-context";

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const METRICS: Array<{ label: string; value: (o: NonNullable<ReturnType<typeof useAdminAnalytics>["data"]>["overview"]) => string }> = [
  { label: "Active Page Packs", value: (o) => o.activePagePacks.toLocaleString("en-IN") },
  { label: "Total Revenue", value: (o) => formatRupees(o.totalRevenue) },
  { label: "Total Students", value: (o) => o.totalStudents.toLocaleString("en-IN") },
  { label: "Orders Today", value: (o) => o.ordersToday.toLocaleString("en-IN") },
  { label: "Orders This Month", value: (o) => o.ordersThisMonth.toLocaleString("en-IN") },
  { label: "Total Orders", value: (o) => o.totalOrders.toLocaleString("en-IN") },
];

export default function DashboardOverview({ userName }: { userName: string }) {
  const { data, loading, refreshing, error, lastUpdated, refresh } = useAdminAnalytics();
  const overview = data?.overview;

  return (
    <div className="admin-dashboard">
      <div className="ad-header">
        <div className="ad-header-row">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1 className="page-title">Welcome back, {userName}</h1>
            <p className="text-secondary">Here&apos;s an overview of your print shop.</p>
          </div>
          <button
            type="button"
            className="ad-refresh-btn"
            onClick={refresh}
            disabled={refreshing || loading}
          >
            {refreshing ? "Syncing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && !data && (
        <div className="ad-error" role="alert">
          {error}
        </div>
      )}

      <section className="ad-stats-grid">
        {METRICS.map((metric) => (
          <div className="ad-stat-card" key={metric.label}>
            <span className="ad-stat-label">{metric.label}</span>
            {loading || !overview ? (
              <span className="ad-skeleton ad-skeleton-value" aria-hidden="true" />
            ) : (
              <strong className="ad-stat-value">{metric.value(overview)}</strong>
            )}
          </div>
        ))}
      </section>

      {lastUpdated && (
        <p className="ad-updated">
          {refreshing ? "Syncing latest data…" : `Updated ${lastUpdated.toLocaleTimeString()}`}
        </p>
      )}

      <style>{`
        .admin-dashboard {
          animation: ad-fade-in 0.4s ease both;
        }

        @keyframes ad-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ad-header {
          margin-bottom: 32px;
        }

        .ad-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ad-header .eyebrow {
          display: inline-block;
          margin-bottom: 10px;
        }

        .ad-header .page-title {
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          margin-bottom: 8px;
        }

        .ad-header p {
          font-size: 1rem;
          color: var(--text-muted);
        }

        .ad-refresh-btn {
          border: 1px solid #e5e5e5;
          background: #ffffff;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 9px 16px;
          cursor: pointer;
          transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
        }

        .ad-refresh-btn:hover:not(:disabled) {
          background: var(--bg-black);
          color: #fff;
          border-color: var(--bg-black);
        }

        .ad-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ad-error {
          border: 1px solid var(--border-primary);
          border-left: 3px solid var(--text-primary);
          background: var(--bg-card);
          color: var(--text-secondary);
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 0.85rem;
        }

        .ad-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .ad-stat-card {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 0px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: box-shadow var(--transition-normal), transform var(--transition-fast);
        }

        .ad-stat-card:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 12px 32px rgba(0, 0, 0, 0.07);
          transform: translateY(-2px);
        }

        .ad-stat-label {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 600;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ad-stat-value {
          font-family: var(--font-serif-alt);
          font-size: clamp(1.9rem, 3vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--text-primary);
        }

        .ad-updated {
          margin-top: 20px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }

        .ad-skeleton {
          display: block;
          border: 1px solid #ececec;
          background: linear-gradient(90deg, #f2f2f0 25%, #e7e7e3 37%, #f2f2f0 63%);
          background-size: 400% 100%;
          animation: ad-shimmer 1.4s ease infinite;
        }

        .ad-skeleton-value {
          width: 60%;
          height: 44px;
        }

        @keyframes ad-shimmer {
          from { background-position: 100% 0; }
          to { background-position: -100% 0; }
        }

        @media (max-width: 1100px) {
          .ad-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 560px) {
          .ad-stats-grid { grid-template-columns: 1fr; gap: 16px; }
          .ad-header { margin-bottom: 24px; }
        }
      `}</style>
    </div>
  );
}
