import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function OperatorDashboard() {
  const { token } = useAuth();
  const { addToast } = useNotifications();

  // Operator orders queue and inventory
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({
    cobraFile: 0,
    transparentFile: 0,
    folder: 0,
    staples: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [slotFilter, setSlotFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const fetchOperatorData = async () => {
    try {
      // Fetch Orders
      const orderRes = await fetch('/api/orders/operator', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }

      // Fetch Inventory (reuse admin metrics endpoint or fetch it from a general status endpoint)
      const metricsRes = await fetch('/api/admin/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setInventory(metricsData.inventory);
      }
    } catch (err) {
      console.error('Error fetching operator data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorData();
    // Poll operator queue every 10 seconds to keep queues fresh!
    const interval = setInterval(() => {
      fetchOperatorData();
    }, 10000);

    // Default date filter to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDateFilter(`${yyyy}-${mm}-${dd}`);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'submitted') nextStatus = 'accepted';
    else if (currentStatus === 'accepted') nextStatus = 'printing';
    else if (currentStatus === 'printing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'collected';

    if (!nextStatus) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        addToast(`Order updated to: ${nextStatus.toUpperCase()}`, 'success');
        fetchOperatorData();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Status update failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Batch action: Accept or print all items matching filters
  const handleBatchAction = async (targetStatus, updateToStatus) => {
    const matchingOrders = filteredOrders.filter(o => o.status === targetStatus);
    if (matchingOrders.length === 0) {
      addToast(`No orders found with status '${targetStatus}' in the selected filter.`, 'warning');
      return;
    }

    let successCount = 0;
    for (const order of matchingOrders) {
      try {
        const res = await fetch(`/api/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: updateToStatus })
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error('Batch update failed for:', order.id);
      }
    }

    addToast(`Batch process completed! Updated ${successCount} orders to ${updateToStatus.toUpperCase()}`, 'success');
    fetchOperatorData();
  };

  // Inventory modifications
  const handleModifyInventory = async (itemKey, amount) => {
    const newCount = Math.max(0, inventory[itemKey] + amount);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [itemKey]: newCount
        })
      });

      if (res.ok) {
        addToast(`Updated ${itemKey} stock.`, 'success');
        fetchOperatorData();
      }
    } catch (err) {
      addToast('Failed to modify stock level', 'error');
    }
  };

  // Filter calculations
  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const slotMatch = slotFilter === 'all' || order.pickupSlot === slotFilter;
    const dateMatch = !dateFilter || order.pickupDate === dateFilter;
    return statusMatch && slotMatch && dateMatch;
  });

  const getStatusButtonText = (status) => {
    switch(status) {
      case 'submitted': return '✓ Accept';
      case 'accepted': return '🖨️ Print';
      case 'printing': return '⚡ Ready';
      case 'ready': return '📦 Collected';
      default: return 'Done';
    }
  };

  return (
    <div className="operator-dashboard fade-in">
      <div className="flex-between dashboard-header">
        <h2 className="page-title">Operator Control Panel</h2>
        <span className="room-badge">📍 VIPS Print Room 102</span>
      </div>

      <div className="operator-grid-layout">
        
        {/* LEFT COLUMN: MAIN ORDERS QUEUE */}
        <div className="queue-section">
          {/* QUEUE FILTERS */}
          <div className="glass-card filters-card slide-up">
            <h3>Filter Print Jobs</h3>
            <div className="filters-row">
              <div className="filter-input-col">
                <label className="glass-label">Pickup Date</label>
                <input 
                  type="date" 
                  className="glass-input" 
                  value={dateFilter} 
                  onChange={e => setDateFilter(e.target.value)}
                />
              </div>

              <div className="filter-input-col">
                <label className="glass-label">Pickup Slot</label>
                <select 
                  className="glass-select" 
                  value={slotFilter} 
                  onChange={e => setSlotFilter(e.target.value)}
                >
                  <option value="all">All Slots</option>
                  <option value="9:00 – 10:00 AM">9:00 – 10:00 AM</option>
                  <option value="12:00 – 1:00 PM">12:00 – 1:00 PM</option>
                  <option value="3:00 – 4:00 PM">3:00 – 4:00 PM</option>
                </select>
              </div>

              <div className="filter-input-col">
                <label className="glass-label">Status</label>
                <select 
                  className="glass-select" 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="accepted">Accepted</option>
                  <option value="printing">Printing</option>
                  <option value="ready">Ready</option>
                  <option value="collected">Collected</option>
                </select>
              </div>
            </div>

            {/* BATCH VIEWER AND ACTIONS */}
            <div className="batch-action-bar">
              <div className="batch-info">
                <span>📦 Matches: <strong>{filteredOrders.length} print orders</strong> in this batch.</span>
              </div>
              <div className="batch-buttons">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleBatchAction('submitted', 'accepted')}
                >
                  Accept All
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleBatchAction('accepted', 'printing')}
                >
                  🖨️ Print Batch
                </button>
                <button 
                  className="btn btn-accent btn-sm"
                  onClick={() => handleBatchAction('printing', 'ready')}
                >
                  ⚡ Mark All Ready
                </button>
              </div>
            </div>
          </div>

          {/* ORDERS TABLE CARD */}
          <div className="glass-card queue-table-card slide-up mt-4">
            <div className="flex-between card-header">
              <h3>Active Print Queue</h3>
              <button className="refresh-btn" onClick={fetchOperatorData}>⟳ Refresh Feed</button>
            </div>

            {loading ? (
              <div className="flex-center py-4"><div className="spinner"></div></div>
            ) : filteredOrders.length > 0 ? (
              <div className="table-responsive">
                <table className="operator-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Document</th>
                      <th>Copies / Side</th>
                      <th>Slot</th>
                      <th>Finishing</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className={`row-status-${order.status}`}>
                        <td>
                          <div className="student-profile-cell">
                            <span className="name">{order.studentName}</span>
                            <span className="course">{order.studentCourse} ({order.studentYear})</span>
                            <span className="phone">📞 {order.studentPhone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="doc-profile-cell">
                            <a href={order.filePath} target="_blank" rel="noopener noreferrer" className="doc-link">
                              📄 {order.fileName}
                            </a>
                            <span className="pages-count">{order.pages} pages</span>
                          </div>
                        </td>
                        <td>
                          <div className="copies-sides-cell">
                            <span className="copies"><strong>{order.copies}</strong> copies</span>
                            <span className="side-type">{order.side === 'double' ? 'Double Sided' : 'Single Sided'}</span>
                            <span className={`color-mode ${order.color}`}>{order.color.toUpperCase()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="slot-cell">
                            <span className="date">{new Date(order.pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span className="slot-time">{order.pickupSlot}</span>
                          </div>
                        </td>
                        <td>
                          <div className="finishing-badges">
                            {Object.entries(order.addons)
                              .filter(([_, val]) => val)
                              .map(([key, _]) => (
                                <span key={key} className={`addon-tag addon-${key}`}>
                                  {key === 'staple' && '📌 Stapled'}
                                  {key === 'punchHoles' && '🕳️ Punched'}
                                  {key === 'cobraFile' && '📁 Cobra File'}
                                  {key === 'transparentFile' && '📄 Clear Sleeve'}
                                  {key === 'folder' && '📂 Folder'}
                                </span>
                              ))}
                            {Object.values(order.addons).every(val => !val) && <span className="no-addons">None</span>}
                          </div>
                        </td>
                        <td>
                          <div className="action-cell">
                            {order.status !== 'collected' ? (
                              <button 
                                className={`btn btn-sm btn-status-trigger status-${order.status}`}
                                onClick={() => handleUpdateStatus(order.id, order.status)}
                              >
                                {getStatusButtonText(order.status)}
                              </button>
                            ) : (
                              <span className="collected-check">✓ Collected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-queue-message">
                <span>🍃</span>
                <p>No print jobs found matching the selected filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY MANAGEMENT */}
        <div className="inventory-section">
          <div className="glass-card inventory-card-panel slide-up">
            <h3>Stationery Stock</h3>
            <p className="card-subtitle">Maintain counts of finishing accessories here.</p>

            <div className="inventory-levels-list">
              {[
                { key: 'cobraFile', name: 'Premium Cobra Files', count: inventory.cobraFile, lowLimit: 10, icon: '📂' },
                { key: 'transparentFile', name: 'Clear Sleeves', count: inventory.transparentFile, lowLimit: 20, icon: '📄' },
                { key: 'folder', name: 'Cardboard Folders', count: inventory.folder, lowLimit: 15, icon: '📁' },
                { key: 'staples', name: 'Staple Pins', count: inventory.staples, lowLimit: 100, icon: '📌' }
              ].map(item => {
                const isLow = item.count <= item.lowLimit;
                return (
                  <div key={item.key} className={`inventory-item-row ${isLow ? 'low-stock' : ''}`}>
                    <div className="item-details">
                      <span className="icon">{item.icon}</span>
                      <div className="info">
                        <span className="name">{item.name}</span>
                        {isLow && <span className="warning-text">⚠️ Low Stock!</span>}
                      </div>
                    </div>
                    <div className="item-adjust">
                      <button className="adjust-btn minus" onClick={() => handleModifyInventory(item.key, -10)}>-</button>
                      <span className="count-display">{item.count}</span>
                      <button className="adjust-btn plus" onClick={() => handleModifyInventory(item.key, 10)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .operator-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .room-badge {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-cyan);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 8px 16px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .operator-grid-layout {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 24px;
        }

        .queue-section {
          display: flex;
          flex-direction: column;
        }

        .filters-card h3, .queue-table-card h3, .inventory-card-panel h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .card-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: -10px;
          margin-bottom: 20px;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .filter-input-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .batch-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .batch-info {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .batch-buttons {
          display: flex;
          gap: 10px;
        }

        .card-header {
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .refresh-btn {
          background: transparent;
          border: none;
          color: var(--accent-cyan);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .refresh-btn:hover {
          text-decoration: underline;
        }

        /* Operator Queue Table */
        .operator-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .operator-table th {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-glass);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .operator-table td {
          padding: 16px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .operator-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.01);
        }

        /* Color differentiation per row status */
        .row-status-ready {
          background: rgba(52, 211, 153, 0.02);
        }
        .row-status-printing {
          background: rgba(251, 191, 36, 0.02);
        }

        .student-profile-cell {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .student-profile-cell .name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .student-profile-cell .course {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .student-profile-cell .phone {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .doc-profile-cell {
          display: flex;
          flex-direction: column;
        }

        .doc-link {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          word-break: break-all;
          max-width: 180px;
        }
        .doc-link:hover {
          color: var(--primary-indigo);
          text-decoration: underline;
        }

        .doc-profile-cell .pages-count {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .copies-sides-cell {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .copies-sides-cell .copies {
          color: var(--text-primary);
        }

        .copies-sides-cell .side-type {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .color-mode {
          font-size: 0.7rem;
          font-weight: 800;
          display: inline-block;
          margin-top: 2px;
        }
        .color-mode.bw {
          color: var(--text-muted);
        }
        .color-mode.color {
          color: var(--accent-magenta);
        }

        .slot-cell {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .slot-cell .date {
          font-weight: 600;
          color: var(--text-primary);
        }

        .slot-cell .slot-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .finishing-badges {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 120px;
        }

        .addon-tag {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          text-align: center;
        }

        .addon-staple { background: rgba(99, 102, 241, 0.1); color: var(--primary-indigo); border: 1px solid rgba(99, 102, 241, 0.2); }
        .addon-punchHoles { background: rgba(6, 182, 212, 0.1); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.2); }
        .addon-cobraFile { background: rgba(217, 70, 239, 0.1); color: var(--accent-magenta); border: 1px solid rgba(217, 70, 239, 0.2); }
        .addon-transparentFile { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); }
        .addon-folder { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }

        .no-addons {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .action-cell {
          display: flex;
        }

        .btn-status-trigger {
          width: 100px;
          text-align: center;
        }

        .btn-status-trigger.status-submitted {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-indigo);
          border: 1px solid var(--primary-indigo);
        }
        .btn-status-trigger.status-submitted:hover {
          background: var(--primary-indigo);
          color: white;
        }

        .btn-status-trigger.status-accepted {
          background: rgba(251, 191, 36, 0.1);
          color: var(--status-printing);
          border: 1px solid var(--status-printing);
        }
        .btn-status-trigger.status-accepted:hover {
          background: var(--status-printing);
          color: #000;
        }

        .btn-status-trigger.status-printing {
          background: rgba(52, 211, 153, 0.1);
          color: var(--status-ready);
          border: 1px solid var(--status-ready);
        }
        .btn-status-trigger.status-printing:hover {
          background: var(--status-ready);
          color: #000;
        }

        .btn-status-trigger.status-ready {
          background: rgba(167, 139, 250, 0.1);
          color: var(--status-collected);
          border: 1px solid var(--status-collected);
        }
        .btn-status-trigger.status-ready:hover {
          background: var(--status-collected);
          color: white;
        }

        .collected-check {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--status-collected);
        }

        .empty-queue-message {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .empty-queue-message span {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        /* Inventory Stock Panel */
        .inventory-levels-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .inventory-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 14px 16px;
          transition: all var(--transition-fast);
        }

        .inventory-item-row.low-stock {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.03);
        }

        .item-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-details .icon {
          font-size: 1.5rem;
        }

        .item-details .info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .item-details .name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .warning-text {
          font-size: 0.75rem;
          color: #f87171;
          font-weight: 700;
          margin-top: 2px;
        }

        .item-adjust {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .adjust-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .adjust-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .count-display {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          width: 45px;
          text-align: center;
        }

        @media (max-width: 900px) {
          .operator-grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
