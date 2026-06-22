import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const plans = [
  {
    id: 'starter_bw',
    rank: 1,
    name: 'Starter B&W',
    price: 249,
    pages: 50,
    includes: '50 Black & White pages',
    supports: ['Black & White printing'],
    features: ['Single or double side', 'Basic queue access', 'Student dashboard']
  },
  {
    id: 'standard_bw',
    rank: 2,
    name: 'Standard B&W',
    price: 499,
    pages: 100,
    includes: '100 Black & White pages',
    supports: ['Black & White printing'],
    features: ['Priority queue', 'Faster processing', 'Usage analytics']
  },
  {
    id: 'hybrid_pro',
    rank: 3,
    name: 'Hybrid Pro',
    price: 749,
    pages: 100,
    includes: '100 Total Pages',
    supports: ['Black & White printing', 'Color printing'],
    features: ['Priority queue', 'Premium support', 'Color documents', 'Detailed analytics']
  }
];

const getCurrentRank = (sub) => sub?.planRank || 0;

const getPlanState = (plan, sub) => {
  const currentRank = getCurrentRank(sub);
  if (!sub || sub.status !== 'active') return 'UPGRADE PLAN';
  if (currentRank === plan.rank) return 'CURRENT PLAN';
  if (currentRank > plan.rank) return 'PLAN HISTORY';
  return 'UPGRADE PLAN';
};

export default function SubscriptionPlans({ setCurrentTab }) {
  const { subscription, buySubscription, refreshUser } = useAuth();
  const { addToast } = useNotifications();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  const currentRank = getCurrentRank(subscription);
  const remainingPages = subscription ? Math.max(0, subscription.pagesAllowed - subscription.pagesUsed) : 0;
  const hasActive = subscription?.status === 'active';

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      await buySubscription(selectedPlan.id);
      await refreshUser();
      addToast(`${selectedPlan.name} activated successfully.`, 'success');
      setSelectedPlan(null);
      setCurrentTab('dashboard');
    } catch (err) {
      addToast(err.message || 'Unable to upgrade plan', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="sp fade-in">
      <header className="sp-header">
        <div>
          <span className="eyebrow">Membership</span>
          <h1 className="page-title">Plans for student printing.</h1>
          <p className="text-secondary">Upgrade anytime. New plans reset your monthly page pool.</p>
        </div>
        <div className="glass-card sp-status">
          <span className="text-muted text-sm">Status</span>
          <strong className="font-black" style={{ textTransform: 'capitalize' }}>{subscription?.status || 'inactive'}</strong>
          <span className="text-muted text-sm">{remainingPages} pages remaining</span>
        </div>
      </header>

      <section className="sp-grid">
        {plans.map((plan) => {
          const state = getPlanState(plan, subscription);
          const isCurrent = state === 'CURRENT PLAN';
          const isHistory = state === 'PLAN HISTORY';

          let badgeColor = 'var(--accent-cyan)';
          let badgeBg = 'rgba(34, 211, 238, 0.1)';
          if (isCurrent) { badgeColor = 'var(--accent-green)'; badgeBg = 'rgba(52, 211, 153, 0.1)'; }
          if (isHistory) { badgeColor = 'var(--text-muted)'; badgeBg = 'rgba(148, 163, 184, 0.08)'; }

          return (
            <article key={plan.id} className={`glass-card sp-card ${isCurrent ? 'active-glow' : ''}`}>
              <span className="sp-badge" style={{ color: badgeColor, background: badgeBg, borderColor: badgeColor + '33' }}>{state}</span>
              <h2 className="sp-name">{plan.name}</h2>
              <p className="sp-includes text-secondary">{plan.includes}</p>

              <div className="sp-price">
                <span className="text-muted">₹</span>
                <strong>{plan.price}</strong>
                <span className="text-muted">/month</span>
              </div>

              <div className="sp-quota">
                <strong>{plan.pages}</strong>
                <span className="text-muted">monthly pages</span>
              </div>

              <ul className="sp-features">
                {[...plan.supports, ...plan.features].map((f) => <li key={f}>{f}</li>)}
              </ul>

              <button
                className={`btn w-100 ${isCurrent || isHistory ? 'btn-secondary' : 'btn-primary'}`}
                type="button"
                disabled={isCurrent || isHistory}
                onClick={() => setSelectedPlan(plan)}
              >
                {isCurrent ? 'Current plan' : isHistory ? 'Plan history' : 'Upgrade'}
              </button>
            </article>
          );
        })}
      </section>

      {/* Comparison */}
      <section className="glass-card">
        <div className="sd-section-head">
          <h2>Compare plans</h2>
          <p className="text-secondary text-sm">Page allowance, color support, queue access.</p>
        </div>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Price</th>
                <th>Pages</th>
                <th>Color</th>
                <th>Queue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td><strong>{plan.name}</strong></td>
                  <td>₹{plan.price}</td>
                  <td>{plan.pages}</td>
                  <td>{plan.id === 'hybrid_pro' ? 'Supported' : 'B&W only'}</td>
                  <td>{plan.rank === 1 ? 'Basic' : 'Priority'}</td>
                  <td><span className={`status-badge ${getPlanState(plan, subscription) === 'CURRENT PLAN' ? 'status-ready' : 'status-accepted'}`}>{getPlanState(plan, subscription)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upgrade Modal */}
      {selectedPlan && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <span className="eyebrow">Confirm upgrade</span>
                <h2 className="font-black" style={{ marginTop: 4, fontSize: '1.15rem' }}>{selectedPlan.name}</h2>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedPlan(null)} type="button" style={{ width: 32, height: 32, padding: 0, fontSize: '1.1rem' }}>✕</button>
            </div>

            <div className="sp-modal-preview">
              {hasActive && (
                <div>
                  <span className="text-muted text-sm">Current remaining</span>
                  <strong>{remainingPages}</strong>
                </div>
              )}
              <div>
                <span className="text-muted text-sm">New balance</span>
                <strong>{selectedPlan.pages}</strong>
              </div>
              <div>
                <span className="text-muted text-sm">Total</span>
                <strong>₹{selectedPlan.price}</strong>
              </div>
            </div>

            <p className="text-secondary text-sm" style={{ lineHeight: 1.5 }}>
              Your plan changes immediately. The monthly page balance resets to the selected plan&apos;s allowance.
              {hasActive && ' Previous plan details will be preserved in your history.'}
            </p>

            <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setSelectedPlan(null)}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={handleUpgrade} disabled={processing}>
                {processing ? <div className="spinner" /> : `Pay ₹${selectedPlan.price}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sp { display: flex; flex-direction: column; gap: 16px; }

        .sp-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: stretch;
        }

        .sp-header p { margin-top: 4px; }

        .sp-status {
          min-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          justify-content: center;
        }

        .sp-status strong { font-size: 1.25rem; }

        .sp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .sp-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }

        .sp-badge {
          align-self: flex-start;
          border-radius: 999px;
          border: 1px solid;
          padding: 5px 10px;
          font-size: 0.68rem;
          font-weight: 800;
        }

        .sp-name { font-size: 1.25rem; font-weight: 800; }

        .sp-includes { font-size: 0.85rem; }

        .sp-price {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .sp-price strong {
          font-size: 2.4rem;
          line-height: 1;
          font-weight: 800;
        }

        .sp-price span { font-size: 0.85rem; font-weight: 600; }

        .sp-quota {
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sp-quota strong { font-size: 1.3rem; }
        .sp-quota span { font-size: 0.8rem; font-weight: 600; }

        .sp-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .sp-features li {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .sp-features li::before {
          content: '✓';
          color: var(--accent-green);
          font-weight: 900;
          margin-right: 8px;
        }

        .sd-section-head h2 { font-size: 1rem; font-weight: 800; margin-bottom: 4px; }

        .sp-modal-preview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .sp-modal-preview div {
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sp-modal-preview strong { font-size: 1.2rem; }

        @media (max-width: 900px) {
          .sp-header,
          .sp-grid {
            grid-template-columns: 1fr;
          }

          .sp-header { flex-direction: column; }
        }

        @media (max-width: 640px) {
          .sp-modal-preview { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
