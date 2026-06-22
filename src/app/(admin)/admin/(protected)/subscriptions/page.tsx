import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      plan: true,
    },
    take: 50,
  });

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Subscriptions</span>
        <h1 className="page-title">Manage subscriptions</h1>
        <p className="text-secondary">{activeCount} active out of {subscriptions.length} total</p>
      </div>

      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Pages</th>
                <th>Used</th>
                <th>Start</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.user.name}</strong>
                    <small>{s.user.email}</small>
                  </td>
                  <td>{s.plan.name}</td>
                  <td>
                    <span className={`status-badge ${s.status === "active" ? "status-READY" : "status-SUBMITTED"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.pagesAllowed}</td>
                  <td>{s.pagesUsed}</td>
                  <td><small>{new Date(s.startDate).toLocaleDateString()}</small></td>
                  <td><small>{new Date(s.expiryDate).toLocaleDateString()}</small></td>
                </tr>
              ))}
              {!subscriptions.length && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state compact"><p>No subscriptions yet.</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
