"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SubscribePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPlans);
    fetch("/api/subscriptions/mine")
      .then((r) => r.json())
      .then((d) => setSubscription(d.subscription))
      .catch(() => {});
  }, []);

  const currentRank = subscription?.plan?.displayOrder || 0;
  const remainingPages = subscription
    ? Math.max(0, subscription.pagesAllowed - subscription.pagesUsed)
    : 0;
  const hasActive = subscription?.status === "active";

  const getPlanState = (plan: any) => {
    if (!hasActive) return "UPGRADE PLAN";
    if (currentRank === plan.displayOrder) return "CURRENT PLAN";
    if (currentRank > plan.displayOrder) return "PLAN HISTORY";
    return "UPGRADE PLAN";
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      toast.success(`${selectedPlan.name} activated!`);
      setSelectedPlan(null);
      setSubscription(data.subscription);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Unable to upgrade plan");
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
          <strong className="font-black" style={{ textTransform: "capitalize" }}>
            {subscription?.status || "inactive"}
          </strong>
          <span className="text-muted text-sm">{remainingPages} pages remaining</span>
        </div>
      </header>

      <section className="sp-grid">
        {plans.map((plan) => {
          const state = getPlanState(plan);
          const isCurrent = state === "CURRENT PLAN";
          const isHistory = state === "PLAN HISTORY";

          let badgeColor = "var(--accent-cyan)";
          let badgeBg = "rgba(34, 211, 238, 0.1)";
          if (isCurrent) {
            badgeColor = "var(--accent-green)";
            badgeBg = "rgba(52, 211, 153, 0.1)";
          }
          if (isHistory) {
            badgeColor = "var(--text-muted)";
            badgeBg = "rgba(148, 163, 184, 0.08)";
          }

          return (
            <article
              key={plan.id}
              className={`glass-card sp-card ${isCurrent ? "active-glow" : ""}`}
            >
              <span
                className="sp-badge"
                style={{
                  color: badgeColor,
                  background: badgeBg,
                  borderColor: badgeColor + "33",
                }}
              >
                {state}
              </span>
              <h2 className="sp-name">{plan.name}</h2>
              {plan.description && (
                <p className="sp-includes text-secondary">{plan.description}</p>
              )}

              <div className="sp-price">
                <span className="text-muted">₹</span>
                <strong>{plan.monthlyPrice}</strong>
                <span className="text-muted">/month</span>
              </div>

              <div className="sp-quota">
                <strong>{plan.pagesIncluded}</strong>
                <span className="text-muted">monthly pages</span>
              </div>

              <button
                className={`btn w-100 ${isCurrent || isHistory ? "btn-secondary" : "btn-primary"}`}
                type="button"
                disabled={isCurrent || isHistory}
                onClick={() => setSelectedPlan(plan)}
              >
                {isCurrent ? "Current plan" : isHistory ? "Past plan" : "Upgrade"}
              </button>
            </article>
          );
        })}
      </section>

      {selectedPlan && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <span className="eyebrow">Confirm upgrade</span>
                <h2 className="font-black" style={{ marginTop: 4, fontSize: "1.15rem" }}>
                  {selectedPlan.name}
                </h2>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedPlan(null)}
                type="button"
                style={{ width: 32, height: 32, padding: 0, fontSize: "1.1rem" }}
              >
                ✕
              </button>
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
                <strong>{selectedPlan.pagesIncluded}</strong>
              </div>
              <div>
                <span className="text-muted text-sm">Total</span>
                <strong>₹{selectedPlan.monthlyPrice}</strong>
              </div>
            </div>

            <p className="text-secondary text-sm" style={{ lineHeight: 1.5 }}>
              Your plan changes immediately. The monthly page balance resets to the selected
              plan&apos;s allowance. {hasActive && "Previous plan details will be preserved."}
            </p>

            <div className="flex gap-3" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setSelectedPlan(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleUpgrade}
                disabled={processing}
              >
                {processing ? <div className="spinner" /> : `Pay ₹${selectedPlan.monthlyPrice}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sp { display: flex; flex-direction: column; gap: 16px; }
        .sp-header { display: flex; justify-content: space-between; gap: 16px; align-items: stretch; }
        .sp-header p { margin-top: 4px; }
        .sp-status { min-width: 200px; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
        .sp-status strong { font-size: 1.25rem; }
        .sp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .sp-card { position: relative; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
        .sp-badge { align-self: flex-start; border-radius: 999px; border: 1px solid; padding: 5px 10px; font-size: 0.68rem; font-weight: 800; }
        .sp-name { font-size: 1.25rem; font-weight: 800; }
        .sp-includes { font-size: 0.85rem; }
        .sp-price { display: flex; align-items: baseline; gap: 3px; }
        .sp-price strong { font-size: 2.4rem; line-height: 1; font-weight: 800; }
        .sp-price span { font-size: 0.85rem; font-weight: 600; }
        .sp-quota { border: 1px solid var(--border-glass); border-radius: 12px; background: rgba(255,255,255,0.04); padding: 12px; display: flex; justify-content: space-between; align-items: center; }
        .sp-quota strong { font-size: 1.3rem; }
        .sp-quota span { font-size: 0.8rem; font-weight: 600; }
        .sp-modal-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
        .sp-modal-preview div { border: 1px solid var(--border-glass); border-radius: 12px; background: rgba(255,255,255,0.04); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .sp-modal-preview strong { font-size: 1.2rem; }
        @media (max-width: 900px) { .sp-header, .sp-grid { grid-template-columns: 1fr; } .sp-header { flex-direction: column; } }
        @media (max-width: 640px) { .sp-modal-preview { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
