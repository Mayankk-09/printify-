import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const statusOrder = ['submitted', 'accepted', 'printing', 'ready', 'collected'];
const nextStatus = { submitted: 'accepted', accepted: 'printing', printing: 'ready', ready: 'collected' };
const statusAction = { submitted: 'Accept', accepted: 'Print', printing: 'Ready', ready: 'Collected' };

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const { addToast } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [oRes, mRes] = await Promise.all([
        fetch('/api/orders/operator', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!oRes.ok) throw new Error('Unable to load queue');
      if (!mRes.ok) throw new Error('Admin access required');
      setOrders(await oRes.json());
      setMetrics(await mRes.json());
    } catch (err) {
      addToast(err.message || 'Admin load failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const ms = statusFilter === 'all' || o.status === statusFilter;
      const md = !dateFilter || o.pickupDate === dateFilter;
      const text = `${o.fileName} ${o.studentName} ${o.studentEmail}`.toLowerCase();
      const mq = text.includes(search.toLowerCase());
      return ms && md && mq;
    });
  }, [orders, statusFilter, dateFilter, search]);

  const updateStatus = async (order) => {
    const status = nextStatus[order.status];
    if (!status) return;
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      addToast(`Order moved to ${status}.`, 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  const updateInventory = async (key, delta) => {
    if (!metrics) return;
    const next = Math.max(0, (metrics.inventory[key] || 0) + delta);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: next })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Inventory update failed');
      addToast('Inventory updated.', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Inventory update failed', 'error');
    }
  };

  const statusCounts = statusOrder.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; }, {});

  return (
    <div className="ad fade-in">
      <header className="ad-header">
        <div>
          <span className="eyebrow">Console</span>
          <h1 className="page-title">Print room operations</h1>
          <p className="text-secondary">Queue control, inventory, and revenue for VIPS Printify.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} type="button">Refresh</button>
      </header>

      {user?.role !== 'admin' ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Admin access required</h3>
          <p>This console requires admin authentication.</p>
        </div>
      ) : loading || !metrics ? (
        <div className="ad-skeleton">
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
      ) : (
        <>
          <section className="ad-stats">
            {[
              ['Active subscribers', metrics.activeSubscribers],
              ['Total revenue', `₹${metrics.totalRevenue}`],
              ['Net profit', `₹${metrics.netProfit}`],
              ['Margin', `${metrics.profitMargin}%`]
            ].map(([label, value]) => (
              <div className="glass-card ad-stat" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>

          <div className="ad-tabs">
            <button className={activeTab === 'queue' ? 'active' : ''} onClick={() => setActiveTab('queue')} type="button">Queue</button>
            <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')} type="button">Analytics</button>
            <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')} type="button">Inventory</button>
          </div>

          {activeTab === 'queue' && (
            <section className="ad-queue-section">
              <div className="glass-card">
                <div className="ad-filters">
                  <input className="form-input" placeholder="Search student or file" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <input className="form-input" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                  <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All statuses</option>
                    {statusOrder.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="ad-queue-counts">
                  {statusOrder.map((s) => (
                    <span className={`status-badge status-${s}`} key={s}>{s}: {statusCounts[s]}</span>
                  ))}
                </div>

                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Document</th>
                        <th>Pickup</th>
                        <th>Print</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <strong>{o.studentName}</strong>
                            <small>{o.studentCourse} / {o.studentPhone}</small>
                          </td>
                          <td>
                            <a href={o.filePath} target="_blank" rel="noopener noreferrer">{o.fileName}</a>
                            <small>{o.pages}p x {o.copies}</small>
                          </td>
                          <td>
                            {new Date(o.pickupDate).toLocaleDateString()}
                            <small>{o.pickupSlot}</small>
                          </td>
                          <td>{o.color === 'color' ? 'Color' : 'B&W'} / {o.side}</td>
                          <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                          <td>
                            {o.status === 'collected' ? (
                              <span className="text-muted text-sm">Done</span>
                            ) : (
                              <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(o)} type="button">{statusAction[o.status]}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!filteredOrders.length && (
                        <tr>
                          <td colSpan={6}>
                            <div className="empty-state compact" style={{ margin: '12px 0' }}>
                              <p>No orders match the filters.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'analytics' && (
            <section className="ad-analytics">
              <div className="glass-card">
                <h2 className="ad-section-title">Revenue</h2>
                <div className="ad-bar-list">
                  <div><span>Subscriptions</span><strong>₹{metrics.revenueBreakdown.subscription}</strong></div>
                  <div><span>Add-ons</span><strong>₹{metrics.revenueBreakdown.addons}</strong></div>
                </div>
              </div>
              <div className="glass-card">
                <h2 className="ad-section-title">Costs</h2>
                <div className="ad-bar-list">
                  <div><span>Printing</span><strong>₹{metrics.costBreakdown.printing}</strong></div>
                  <div><span>Stationery</span><strong>₹{metrics.costBreakdown.stationery}</strong></div>
                </div>
              </div>
              <div className="glass-card">
                <h2 className="ad-section-title">Throughput</h2>
                <div className="ad-bar-list">
                  <div><span>Orders today</span><strong>{metrics.ordersToday}</strong></div>
                  <div><span>Pages today</span><strong>{metrics.pagesPrintedToday}</strong></div>
                  <div><span>All-time pages</span><strong>{metrics.totalPagesPrinted}</strong></div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'inventory' && (
            <section className="ad-inventory-section">
              <div className="glass-card">
                <h2 className="ad-section-title">Stock levels</h2>
                <div className="ad-inv-grid">
                  {[
                    ['cobraFile', 'Cobra files'],
                    ['transparentFile', 'Clear covers'],
                    ['folder', 'Folders'],
                    ['staples', 'Staples']
                  ].map(([key, label]) => (
                    <div className="ad-inv-row" key={key}>
                      <div>
                        <strong>{label}</strong>
                        <small className="text-muted">{metrics.inventory[key]} in stock</small>
                      </div>
                      <div className="ad-inv-actions">
                        <button type="button" onClick={() => updateInventory(key, -10)}>−</button>
                        <button type="button" onClick={() => updateInventory(key, 10)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <style>{`
        .ad { display: flex; flex-direction: column; gap: 16px; }

        .ad-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }

        .ad-header p { margin-top: 4px; }
        .ad-skeleton { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        .ad-stat {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ad-stat span { color: var(--text-muted); font-size: 0.78rem; font-weight: 600; }
        .ad-stat strong { font-size: 1.5rem; }

        .ad-tabs {
          display: inline-flex;
          align-self: flex-start;
          gap: 4px;
          padding: 4px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
        }

        .ad-tabs button {
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--text-muted);
          padding: 9px 14px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .ad-tabs button.active {
          background: rgba(139,92,246,0.18);
          color: var(--text-primary);
        }

        .ad-filters {
          display: grid;
          grid-template-columns: 1fr 180px 160px;
          gap: 10px;
          margin-bottom: 12px;
        }

        .ad-queue-counts {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .form-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 10px 12px;
          color: var(--text-primary);
          font-size: 0.88rem;
          outline: none;
          width: 100%;
          transition: border-color var(--transition-fast);
        }

        .form-input:focus { border-color: var(--primary-indigo); box-shadow: 0 0 0 3px rgba(139,92,246,0.18); }

        .ad-section-title { font-size: 1rem; font-weight: 800; margin-bottom: 12px; }
        .ad-bar-list { display: grid; gap: 10px; }
        .ad-bar-list div { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; }
        .ad-bar-list span { color: var(--text-muted); font-size: 0.82rem; }

        .ad-analytics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        .ad-inv-grid { display: grid; gap: 10px; }

        .ad-inv-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          padding: 12px;
        }

        .ad-inv-row strong { font-size: 0.9rem; }
        .ad-inv-row small { display: block; margin-top: 2px; }

        .ad-inv-actions {
          display: flex;
          gap: 6px;
        }

        .ad-inv-actions button {
          width: 30px;
          height: 30px;
          border: 1px solid var(--border-glass);
          border-radius: 9px;
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 900;
          font-size: 0.9rem;
        }

        .btn-sm { min-height: 30px; padding: 5px 10px; border-radius: 8px; font-size: 0.78rem; }

        @media (max-width: 900px) {
          .ad-stats,
          .ad-analytics,
          .ad-skeleton {
            grid-template-columns: repeat(2, 1fr);
          }

          .ad-filters { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .ad-header { flex-direction: column; }
          .ad-stats,
          .ad-analytics,
          .ad-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
