import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";

async function getMetrics() {
  const [totalUsers, totalOrders, totalSubscriptions, payments] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.order.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.payment.findMany({ where: { status: "COMPLETED" } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = await prisma.order.count({
    where: { createdAt: { gte: today } },
  });

  const ordersThisMonth = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
      },
    },
  });

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusCounts: Record<string, number> = {};
  ordersByStatus.forEach((o) => {
    statusCounts[o.status] = o._count;
  });

  return {
    totalStudents: totalUsers,
    totalOrders,
    activeSubscriptions: totalSubscriptions,
    revenue,
    ordersToday,
    ordersThisMonth,
    ordersByStatus: statusCounts,
  };
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const metrics = await getMetrics();

  return (
    <div className="admin-dashboard">
      <div className="ad-header" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="page-title">Welcome back, {session.user.name}</h1>
          <p className="text-secondary">Here&apos;s an overview of your print shop.</p>
        </div>
      </div>

      <section className="ad-stats-grid">
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Active Subscriptions</span>
          <strong className="ad-stat-value">{metrics.activeSubscriptions}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Total Revenue</span>
          <strong className="ad-stat-value">₹{metrics.revenue.toLocaleString()}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Total Students</span>
          <strong className="ad-stat-value">{metrics.totalStudents}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Orders Today</span>
          <strong className="ad-stat-value">{metrics.ordersToday}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Orders This Month</span>
          <strong className="ad-stat-value">{metrics.ordersThisMonth}</strong>
        </div>
        <div className="glass-card ad-stat-card">
          <span className="ad-stat-label">Total Orders</span>
          <strong className="ad-stat-value">{metrics.totalOrders}</strong>
        </div>
      </section>

      <div className="ad-links" style={{ marginTop: 24 }}>
        <Link href="/admin/orders" className="glass-card ad-link-card">
          <h3>Manage Orders</h3>
          <p className="text-secondary text-sm">View and update print order statuses</p>
        </Link>
        <Link href="/admin/users" className="glass-card ad-link-card">
          <h3>Manage Users</h3>
          <p className="text-secondary text-sm">View and manage student accounts</p>
        </Link>
        <Link href="/admin/plans" className="glass-card ad-link-card">
          <h3>Manage Plans</h3>
          <p className="text-secondary text-sm">Create and edit subscription plans</p>
        </Link>
        <Link href="/admin/analytics" className="glass-card ad-link-card">
          <h3>Analytics</h3>
          <p className="text-secondary text-sm">Detailed revenue and usage analytics</p>
        </Link>
      </div>

      <style>{`
        .ad-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ad-stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .ad-stat-label { color: var(--text-muted); font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .ad-stat-value { font-size: 2rem; font-weight: 800; }
        .ad-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .ad-link-card { padding: 24px; text-decoration: none; display: flex; flex-direction: column; gap: 8px; cursor: pointer; }
        .ad-link-card:hover { border-color: var(--border-active); }
        .ad-link-card h3 { font-size: 1.1rem; font-weight: 700; }
        @media (max-width: 860px) { .ad-stats-grid, .ad-links { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
