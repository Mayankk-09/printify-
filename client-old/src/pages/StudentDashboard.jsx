import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const statusSteps = ['submitted', 'accepted', 'printing', 'ready', 'collected'];
const statusLabels = { submitted: 'Submitted', accepted: 'Accepted', printing: 'Printing', ready: 'Ready', collected: 'Collected' };
const statusColors = { submitted: '#94a3b8', accepted: '#60a5fa', printing: '#fbbf24', ready: '#34d399', collected: '#a78bfa' };

const formatPlan = (sub) => {
  if (!sub || sub.status !== 'active') return 'No active plan';
  return sub.planName || 'Active plan';
};

const getPickupCode = (order) => `VP-${order?.id?.replace('ORD-', '') || '000000'}`;

export default function StudentDashboard({ setCurrentTab }) {
  const { user, subscription, token, refreshUser } = useAuth();
  const { addToast } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Unable to load orders');
      setOrders(await res.json());
    } catch (err) {
      addToast(err.message || 'Unable to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    refreshUser();
    const interval = window.setInterval(() => {
      fetchOrders();
      refreshUser();
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const activeOrder = orders.find((o) => o.status !== 'collected');
  const recentOrders = orders.slice(0, 5);
  const totalPages = subscription?.pagesAllowed || 0;
  const usedPages = subscription?.pagesUsed || 0;
  const remainingPages = Math.max(0, totalPages - usedPages);
  const usagePercent = totalPages ? Math.min(100, Math.round((usedPages / totalPages) * 100)) : 0;

  const queueCounts = statusSteps.reduce((acc, step) => {
    acc[step] = orders.filter((o) => o.status === step).length;
    return acc;
  }, {});

  const thisMonth = new Date().getMonth();
  const ordersThisMonth = orders.filter((o) => new Date(o.createdAt).getMonth() === thisMonth).length;
  const totalPrintedPages = orders.reduce((sum, o) => sum + o.pages * o.copies, 0);
  const monthlyUsage = orders
    .filter((o) => new Date(o.createdAt).getMonth() === thisMonth)
    .reduce((sum, o) => sum + o.pages * o.copies, 0);
  const savedMoney = Math.max(0, Math.round(totalPrintedPages * 2.5 - (subscription?.price || 0)));

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const mf = filter === 'all' || o.status === filter;
      const ms = o.fileName.toLowerCase().includes(search.toLowerCase());
      return mf && ms;
    });
  }, [orders, filter, search]);

  const Skeleton = ({ height = 120, mb = true }) => (
    <div className="skeleton" style={{ height, marginBottom: mb ? 12 : 0, borderRadius: '14px' }} />
  );

  const SkeletonText = ({ width = '80%' }) => (
    <div className="skeleton" style={{ height: 14, width, borderRadius: 6, marginBottom: 8 }} />
  );

  return (
    <div className="sd fade-in">
      {/* ── Hero ── */}
      <section className="sd-hero glass-card">
        <div className="sd-hero-copy">
          <span className="eyebrow">Dashboard</span>
          <h1>Hey, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <p>Track your prints, upload documents, and manage your plan.</p>
          <button className="btn btn-primary" onClick={() => setCurrentTab('upload')} type="button">
            ↑ Upload document
          </button>
        </div>
        <div className="sd-hero-metrics">
          {[
            [remainingPages, 'Remaining pages'],
            [formatPlan(subscription), 'Current plan'],
            [activeOrder ? activeOrder.pickupSlot : '—', 'Next pickup'],
            [orders.filter((o) => o.status !== 'collected').length, 'Active jobs']
          ].map(([val, label]) => (
            <div key={label} className="sd-hero-metric">
              <span className="sd-hero-val">{val}</span>
              <span className="sd-hero-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Grid: Sub + Quick + Queue ── */}
      <section className="sd-grid-3">
        {/* Subscription Card */}
        <div className={`glass-card sd-sub ${subscription?.status === 'active' ? 'active-glow' : ''}`}>
          <div className="sd-sub-head">
            <div>
              <span className="eyebrow">Subscription</span>
              <h2>{formatPlan(subscription)}</h2>
            </div>
            <span className={`status-badge ${subscription?.status === 'active' ? 'status-ready' : 'status-submitted'}`}>
              {subscription?.status || 'inactive'}
            </span>
          </div>
          {subscription ? (
            <>
              <div className="sd-sub-ring" style={{ '--usage': `${usagePercent}%` }}>
                <div className="sd-sub-ring-inner">
                  <strong>{remainingPages}</strong>
                  <span>left</span>
                </div>
              </div>
              <div className="sd-sub-info">
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${usagePercent}%` }} /></div>
                <p>{usedPages} of {totalPages} pages used</p>
                <p className="text-muted text-sm">Expires {new Date(subscription.expiryDate).toLocaleDateString()}</p>
              </div>
            </>
          ) : (
            <div className="empty-state compact" style={{ margin: '12px 0' }}>
              <p>No active plan</p>
            </div>
          )}
          <button className="btn btn-secondary w-100" onClick={() => setCurrentTab('subscribe')} type="button">
            {subscription ? 'Change plan' : 'Choose plan'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="glass-card sd-actions">
          <div className="sd-section-head"><h2>Quick actions</h2></div>
          <div className="sd-actions-grid">
            {[
              ['↑ Upload', 'Start a new print job', 'upload'],
              ['☰ Orders', 'View recent history', 'dashboard'],
              ['◉ Plan', 'Manage subscription', 'subscribe'],
              ['⌂ Code', activeOrder ? getPickupCode(activeOrder) : 'No active code', 'dashboard'],
              ['? Help', 'Contact print room', 'dashboard']
            ].map(([title, desc, tab]) => (
              <button key={title} className="sd-action-btn" onClick={() => setCurrentTab(tab)} type="button">
                <strong>{title}</strong>
                <span>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Queue Status */}
        <div className="glass-card sd-queue">
          <div className="sd-section-head"><h2>Queue</h2></div>
          <div className="sd-queue-steps">
            {statusSteps.map((step, i) => (
              <div key={step} className="sd-queue-step">
                <span className="sd-queue-dot" style={{ background: `${statusColors[step]}22`, color: statusColors[step] }}>
                  {queueCounts[step]}
                </span>
                <div>
                  <strong>{statusLabels[step]}</strong>
                  <small>Stage {i + 1}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="sd-stats">
        {[
          ['Total pages', totalPrintedPages],
          ['Monthly usage', monthlyUsage],
          ['Orders this month', ordersThisMonth],
          ['Saved', `₹${savedMoney}`]
        ].map(([label, value]) => (
          <div className="glass-card sd-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      {/* ── Orders + Pickup ── */}
      <section className="sd-bottom">
        <div className="glass-card sd-orders">
          <div className="sd-orders-head">
            <div>
              <h2>Orders</h2>
              <p className="text-secondary text-sm">Last 5 orders with current status</p>
            </div>
            <div className="sd-orders-controls">
              <input className="form-input" placeholder="Search files" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '9px 12px', fontSize: '0.85rem' }} />
              <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '9px 12px', fontSize: '0.85rem' }}>
                <option value="all">All</option>
                {statusSteps.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <Skeleton height={52} />
              <Skeleton height={52} />
              <Skeleton height={52} />
            </div>
          ) : filteredOrders.length ? (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Pages</th>
                    <th>Pickup</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(search || filter !== 'all' ? filteredOrders : recentOrders).map((o) => (
                    <tr key={o.id}>
                      <td>
                        <a href={o.filePath} target="_blank" rel="noopener noreferrer">{o.fileName}</a>
                        <small>{o.color === 'color' ? 'Color' : 'B&W'} / {o.side === 'double' ? 'Double' : 'Single'}</small>
                      </td>
                      <td>{o.pages * o.copies}</td>
                      <td>
                        {new Date(o.pickupDate).toLocaleDateString()}
                        <small>{o.pickupSlot}</small>
                      </td>
                      <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No orders yet</h3>
              <p>Upload your first document to start tracking print jobs.</p>
              <button className="btn btn-primary" onClick={() => setCurrentTab('upload')} type="button">Upload document</button>
            </div>
          )}
        </div>

        <aside className="glass-card sd-pickup">
          <div className="sd-section-head"><h2>Pickup code</h2></div>
          {activeOrder ? (
            <>
              <div className="qr-block" aria-label="Pickup QR code">
                {Array.from({ length: 49 }).map((_, i) => (
                  <span key={i} className={(i * 7 + getPickupCode(activeOrder).length) % 3 === 0 ? 'filled' : ''} />
                ))}
              </div>
              <div className="barcode">
                {Array.from({ length: 20 }).map((_, i) => <span key={i} style={{ height: `${16 + (i % 4) * 5}px` }} />)}
              </div>
              <strong className="sd-pickup-code">{getPickupCode(activeOrder)}</strong>
              <p className="text-secondary text-sm">Show this at the print room when your order is ready.</p>
            </>
          ) : (
            <div className="empty-state compact">
              <p>No active pickup code.</p>
            </div>
          )}
        </aside>
      </section>

      <style>{`
        .sd { display: flex; flex-direction: column; gap: 16px; }

        .sd-hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          padding: 24px;
        }

        .sd-hero-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .sd-hero-copy h1 {
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .sd-hero-copy p {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .sd-hero-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .sd-hero-metric {
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sd-hero-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          text-transform: capitalize;
        }

        .sd-hero-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .sd-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1.2fr 0.9fr;
          gap: 16px;
          align-items: stretch;
        }

        .sd-section-head h2 {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .sd-sub { display: flex; flex-direction: column; gap: 12px; }
        .sd-sub-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .sd-sub-head h2 { font-size: 1rem; font-weight: 800; margin-top: 4px; }

        .sd-sub-ring {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          margin: 4px auto 0;
          display: grid;
          place-items: center;
          background: conic-gradient(var(--primary-indigo) var(--usage), rgba(255,255,255,0.06) 0);
          flex-shrink: 0;
        }

        .sd-sub-ring-inner {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-space);
        }

        .sd-sub-ring-inner strong { font-size: 1.6rem; line-height: 1; }
        .sd-sub-ring-inner span { color: var(--text-muted); font-size: 0.72rem; }

        .sd-sub-info { display: flex; flex-direction: column; gap: 6px; }
        .sd-sub-info p { font-size: 0.82rem; color: var(--text-secondary); }

        .sd-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .sd-action-btn {
          text-align: left;
          cursor: pointer;
          padding: 12px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }

        .sd-action-btn:hover {
          border-color: var(--border-active);
          transform: translateY(-1px);
        }

        .sd-action-btn span {
          color: var(--text-muted);
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .sd-queue-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sd-queue-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
        }

        .sd-queue-step strong { text-transform: capitalize; font-size: 0.88rem; }
        .sd-queue-step small { color: var(--text-muted); font-size: 0.72rem; }

        .sd-queue-dot {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.82rem;
          flex-shrink: 0;
        }

        .sd-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .sd-stat {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sd-stat span { color: var(--text-muted); font-size: 0.78rem; font-weight: 600; }
        .sd-stat strong { font-size: 1.5rem; }

        .sd-bottom {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 16px;
        }

        .sd-orders-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .sd-orders-head h2 { font-size: 1rem; font-weight: 800; }

        .sd-orders-controls {
          display: grid;
          grid-template-columns: minmax(140px, 1fr) 120px;
          gap: 8px;
        }

        .sd-pickup {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
        }

        .sd-pickup-code {
          font-size: 1.2rem;
          letter-spacing: 0.06em;
          font-weight: 800;
        }

        .form-input, .form-select {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 11px 13px;
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
          width: 100%;
          transition: border-color var(--transition-fast);
        }

        .form-input:focus, .form-select:focus {
          border-color: var(--primary-indigo);
        }

        @media (max-width: 960px) {
          .sd-hero,
          .sd-grid-3,
          .sd-bottom {
            grid-template-columns: 1fr;
          }

          .sd-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .sd-hero { padding: 16px; }
          .sd-hero-metrics,
          .sd-stats,
          .sd-actions-grid,
          .sd-orders-controls {
            grid-template-columns: 1fr;
          }

          .sd-hero-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
