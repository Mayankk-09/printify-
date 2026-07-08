import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const allOrders = await prisma.order.findMany({
    where: { status: { in: ["ACCEPTED", "PRINTING", "READY", "COLLECTED"] } },
  });

  const payments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
  });

  const activeSubs = await prisma.subscription.count({ where: { status: "active" } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = allOrders.filter((o) => new Date(o.createdAt) >= today).length;
  const pagesToday = allOrders
    .filter((o) => new Date(o.createdAt) >= today)
    .reduce((sum, o) => sum + o.pages * o.copies, 0);
  const totalPages = allOrders.reduce((sum, o) => sum + o.pages * o.copies, 0);

  const packRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const addonRevenue = allOrders.reduce((sum, o) => sum + ((o as any).addonCost || 0), 0);
  const totalRevenue = packRevenue + addonRevenue;

  const bwCost = 0.50;
  const colorCost = 3.00;
  let totalPrintingCost = 0;
  allOrders.forEach((o) => {
    const rate = o.printMode === "COLOR" ? colorCost : bwCost;
    totalPrintingCost += o.pages * o.copies * rate;
  });

  const netProfit = totalRevenue - totalPrintingCost;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Analytics</span>
        <h1 className="page-title">Revenue & usage</h1>
      </div>

      <div className="ad-stats-grid" style={{ marginBottom: 24 }}>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Active Page Packs</span>
          <strong className="ad-stat-value">{activeSubs}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Total Revenue</span>
          <strong className="ad-stat-value">₹{totalRevenue.toLocaleString()}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Net Profit</span>
          <strong className="ad-stat-value">₹{netProfit.toFixed(2)}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Profit Margin</span>
          <strong className="ad-stat-value">{profitMargin}%</strong>
        </div>
      </div>

      <div className="ad-analytics-grid">
        <div className="glass-card">
          <h2 className="ad-section-title">Revenue Breakdown</h2>
          <div className="ad-bar-list">
            <div><span>Page Packs</span><strong>₹{packRevenue}</strong></div>
            <div><span>Add-ons</span><strong>₹{addonRevenue}</strong></div>
          </div>
        </div>
        <div className="glass-card">
          <h2 className="ad-section-title">Cost Breakdown</h2>
          <div className="ad-bar-list">
            <div><span>Printing</span><strong>₹{totalPrintingCost.toFixed(2)}</strong></div>
          </div>
        </div>
        <div className="glass-card">
          <h2 className="ad-section-title">Throughput</h2>
          <div className="ad-bar-list">
            <div><span>Orders today</span><strong>{ordersToday}</strong></div>
            <div><span>Pages today</span><strong>{pagesToday}</strong></div>
            <div><span>All-time pages</span><strong>{totalPages}</strong></div>
          </div>
        </div>
      </div>

      <style>{`
        .ad-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ad-stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .ad-stat-label { color: var(--text-muted); font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; font-family: var(--font-mono); }
        .ad-stat-value { font-size: 2rem; font-weight: 800; font-family: var(--font-serif-alt); letter-spacing: -0.03em; }
        .ad-analytics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ad-section-title { font-size: 1rem; font-weight: 800; margin-bottom: 12px; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .ad-bar-list { display: grid; gap: 10px; }
        .ad-bar-list div { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 10px; }
        .ad-bar-list span { color: var(--text-muted); font-size: 0.82rem; }
        .ad-bar-list strong { font-family: var(--font-mono); }
        @media (max-width: 860px) { .ad-stats-grid, .ad-analytics-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
