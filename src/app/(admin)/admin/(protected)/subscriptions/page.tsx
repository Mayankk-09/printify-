import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      pack: true,
    },
    take: 50,
  });

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const totalPagesSold = subscriptions.reduce((s, sub) => s + sub.pagesAllowed, 0);
  const totalPagesUsed = subscriptions.reduce((s, sub) => s + sub.pagesUsed, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Purchases</span>
        <h1 className="page-title">Page pack purchases</h1>
        <p className="text-secondary">
          {activeCount} active packs out of {subscriptions.length} total purchases
          &middot; {totalPagesSold} pages sold, {totalPagesUsed} used
        </p>
      </div>

      <div className="glass-card">
        {/* Desktop table */}
        <div className="as-table-wrap">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Pack</th>
                  <th>Status</th>
                  <th>Pages</th>
                  <th>Used</th>
                  <th>Remaining</th>
                  <th>Purchased</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.user.name}</strong>
                      <small>{s.user.email}</small>
                    </td>
                    <td>{s.pack?.name || "—"}</td>
                    <td>
                      <span className={`status-badge ${s.status === "active" ? "status-READY" : "status-SUBMITTED"}`}>
                        {s.status === "active" ? (s.pagesUsed >= s.pagesAllowed ? "exhausted" : "active") : s.status}
                      </span>
                    </td>
                    <td>{s.pagesAllowed}</td>
                    <td>{s.pagesUsed}</td>
                    <td>{Math.max(0, s.pagesAllowed - s.pagesUsed)}</td>
                    <td><small>{new Date(s.createdAt).toLocaleDateString()}</small></td>
                  </tr>
                ))}
                {!subscriptions.length && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state compact"><p>No purchases yet.</p></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="as-mobile-cards">
          {subscriptions.length === 0 ? (
            <div className="empty-state compact"><p>No purchases yet.</p></div>
          ) : (
            subscriptions.map((s) => (
              <div key={s.id} className="glass-card as-mobile-card">
                <div className="as-mc-head">
                  <div>
                    <strong>{s.user.name}</strong>
                    <span className="text-muted text-sm">{s.user.email}</span>
                  </div>
                  <span className={`status-badge ${s.status === "active" ? "status-READY" : "status-SUBMITTED"}`}>
                    {s.status === "active" ? (s.pagesUsed >= s.pagesAllowed ? "exhausted" : "active") : s.status}
                  </span>
                </div>
                <div className="as-mc-body">
                  <div className="as-mc-row"><span>Pack</span><strong>{s.pack?.name || "—"}</strong></div>
                  <div className="as-mc-row"><span>Pages</span><strong>{s.pagesAllowed}</strong></div>
                  <div className="as-mc-row"><span>Used</span><strong>{s.pagesUsed}</strong></div>
                  <div className="as-mc-row"><span>Remaining</span><strong>{Math.max(0, s.pagesAllowed - s.pagesUsed)}</strong></div>
                  <div className="as-mc-row"><span>Purchased</span><span>{new Date(s.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .as-mobile-cards { display: none; flex-direction: column; gap: 12px; }
        .as-mobile-card { padding: 16px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .as-mobile-card:active { transform: scale(0.99); }
        .as-mc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .as-mc-head div { display: flex; flex-direction: column; }
        .as-mc-body { display: grid; gap: 6px; }
        .as-mc-row { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; }
        .as-mc-row span:first-child { color: var(--text-muted); }
        .as-mc-row strong { font-family: var(--font-mono); }
        @media (max-width: 768px) { .as-table-wrap { display: none; } .as-mobile-cards { display: flex; } }
      `}</style>
    </div>
  );
}
