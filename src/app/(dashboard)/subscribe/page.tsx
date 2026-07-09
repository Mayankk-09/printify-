"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PACK_TYPE_LABELS: Record<string, string> = {
  BW_ONLY: "B&W Only",
  BW_AND_COLOR: "B&W & Color",
};

export default function SubscribePage() {
  const router = useRouter();
  const [packs, setPacks] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [claimingTrial, setClaimingTrial] = useState(false);
  const [trialConfirm, setTrialConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPacks);
    fetch("/api/subscriptions/mine")
      .then((r) => r.json())
      .then(setBalance)
      .catch(() => {});
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => setUserData(d))
      .catch(() => {});
  }, []);

  const handlePurchase = async () => {
    if (!selectedPack) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selectedPack.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Purchase failed");
      toast.success(`${selectedPack.name} purchased!`);
      setSelectedPack(null);
      const updated = await fetch("/api/subscriptions/mine").then((r) => r.json());
      setBalance(updated);
    } catch (err: any) {
      toast.error(err.message || "Unable to purchase");
    } finally {
      setProcessing(false);
    }
  };

  const handleClaimTrial = async () => {
    setClaimingTrial(true);
    try {
      const res = await fetch("/api/trials/claim", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim trial");
      setUserData((prev: any) => ({ ...prev, hasClaimedTrial: true, claimedTrialAt: new Date() }));
      setTrialConfirm(true);
    } catch (err: any) {
      toast.error(err.message || "Unable to claim trial");
    } finally {
      setClaimingTrial(false);
    }
  };

  const remaining = balance?.remainingPages ?? 0;
  const hasClaimedTrial = userData?.hasClaimedTrial ?? false;
  const hasUsedTrial = userData?.hasUsedTrial ?? false;
  const canClaimTrial = !hasClaimedTrial && !hasUsedTrial;

  return (
    <div className="pp fade-in">
      <header className="pp-header">
        <div>
          <span className="eyebrow">Page Packs</span>
          <h1 className="page-title">Choose a page pack.</h1>
          <p className="text-secondary">No expiry. No recurring charges. Pages are yours forever.</p>
        </div>
        <div className="glass-card pp-balance">
          <span className="text-muted text-sm">Your page balance</span>
          <strong className="pp-balance-num">{remaining}</strong>
          <span className="text-muted text-sm">pages remaining</span>
        </div>
      </header>

      {canClaimTrial && (
        <section className="pp-trial">
          <div className="glass-card pp-trial-card">
            <div className="pp-trial-icon">🎉</div>
            <div className="pp-trial-info">
              <h2>Free Trial</h2>
              <p className="text-secondary text-sm">
                One free black-and-white print order of up to 5 pages. No payment needed.
              </p>
              <ul className="pp-trial-rules">
                <li>Up to 5 pages</li>
                <li>Black & white only</li>
                <li>Single copy</li>
                <li>One per lifetime</li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleClaimTrial}
              disabled={claimingTrial}
            >
              {claimingTrial ? <div className="spinner" /> : "Claim Free Trial — ₹0"}
            </button>
          </div>
        </section>
      )}

      {trialConfirm && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card" style={{ maxWidth: 480, textAlign: "center" }}>
            <div className="trial-confetti">🎉</div>
            <h2 className="font-black" style={{ fontSize: "1.4rem", marginBottom: 12 }}>
              Congratulations!
            </h2>
            <p className="text-secondary" style={{ lineHeight: 1.7, marginBottom: 20 }}>
              You have successfully claimed your Free Trial.
              <br /><br />
              Your first Black &amp; White print order of up to 5 printable pages is completely free.
            </p>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => { setTrialConfirm(false); router.push("/upload"); }}
            >
              Upload Document
            </button>
          </div>
        </div>
      )}

      <section className="pp-grid">
        {packs.map((pack) => {
          const pricePerPage = pack.pages > 0 ? (pack.price / 100 / pack.pages).toFixed(2) : "0";
          const isBestValue = pack.pages >= 150;
          return (
            <article
              key={pack.id}
              className={`glass-card pp-card ${isBestValue ? "best-value" : ""}`}
            >
              {isBestValue && (
                <span className="pp-badge">Best Value</span>
              )}
              <h2 className="pp-name">{pack.name}</h2>
              {pack.description && (
                <p className="pp-desc text-secondary">{pack.description}</p>
              )}
              <div className="pp-price">
                <span className="text-muted">₹</span>
                <strong>{(pack.price / 100).toFixed(2)}</strong>
              </div>
              <div className="pp-pages">
                <strong>{pack.pages}</strong>
                <span className="text-muted">pages</span>
              </div>
              <div className="pp-per-page">
                ₹{pricePerPage} per page
              </div>
              <div className="pp-print-mode">
                {PACK_TYPE_LABELS[pack.packType] || "B&W & Color"}
              </div>
              <button
                className="btn btn-primary w-100"
                type="button"
                onClick={() => setSelectedPack(pack)}
              >
                Buy Now
              </button>
            </article>
          );
        })}
      </section>

      {selectedPack && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <span className="eyebrow">Confirm purchase</span>
                <h2 className="font-black" style={{ marginTop: 4, fontSize: "1.15rem" }}>
                  {selectedPack.name}
                </h2>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedPack(null)}
                type="button"
                style={{ width: 32, height: 32, padding: 0, fontSize: "1.1rem" }}
              >
                ✕
              </button>
            </div>

            <div className="pp-modal-preview">
              <div>
                <span className="text-muted text-sm">Pages</span>
                <strong>{selectedPack.pages}</strong>
              </div>
              <div>
                <span className="text-muted text-sm">Price</span>
                <strong>₹{(selectedPack.price / 100).toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-muted text-sm">Print mode</span>
                <strong>{PACK_TYPE_LABELS[selectedPack.packType] || "B&W & Color"}</strong>
              </div>
            </div>

            <p className="text-secondary text-sm" style={{ lineHeight: 1.5 }}>
              Pages never expire. Use them anytime for any print job.
              {remaining > 0 && ` You already have ${remaining} pages remaining — this will be added on top.`}
            </p>

            <div className="flex gap-3" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setSelectedPack(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handlePurchase}
                disabled={processing}
              >
                {processing ? <div className="spinner" /> : `Pay ₹${(selectedPack.price / 100).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pp { display: flex; flex-direction: column; gap: 16px; }
        .pp-header { display: flex; justify-content: space-between; gap: 16px; align-items: stretch; }
        .pp-header p { margin-top: 4px; }
        .pp-balance { min-width: 200px; display: flex; flex-direction: column; gap: 4px; justify-content: center; align-items: center; border: 1px solid var(--border-primary); background: var(--bg-card); padding: 20px; }
        .pp-balance-num { font-size: 2.2rem; line-height: 1; font-weight: 800; font-family: var(--font-serif-alt); letter-spacing: -0.03em; }
        .pp-trial-card { display: flex; align-items: center; gap: 16px; border: 2px dashed var(--border-primary); background: var(--bg-card); padding: 20px; }
        .pp-trial-info { flex: 1; }
        .pp-trial-info h2 { font-size: 1rem; font-weight: 800; font-family: var(--font-serif); }
        .pp-trial-icon { font-size: 2rem; flex-shrink: 0; }
        .pp-trial-rules { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 0.78rem; color: var(--text-secondary); font-family: var(--font-mono); }
        .pp-trial-rules li::before { content: "•"; margin-right: 4px; }
        .pp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pp-card { position: relative; display: flex; flex-direction: column; gap: 10px; overflow: hidden; padding: 20px; border: 1px solid var(--border-primary); background: var(--bg-card); }
        .pp-card:active { transform: scale(0.99); }
        .pp-card.best-value { border-width: 2px; }
        .pp-badge { position: absolute; top: 12px; right: 12px; background: var(--bg-black); color: #fff; padding: 4px 10px; font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; }
        .pp-name { font-size: 1.25rem; font-weight: 800; padding-right: 80px; font-family: var(--font-serif); letter-spacing: -0.03em; }
        .pp-desc { font-size: 0.85rem; }
        .pp-price { display: flex; align-items: baseline; gap: 3px; }
        .pp-price strong { font-size: 2.4rem; line-height: 1; font-weight: 800; font-family: var(--font-serif-alt); letter-spacing: -0.03em; }
        .pp-price span { font-size: 0.85rem; font-weight: 600; }
        .pp-pages { border: 1px solid var(--border-light); padding: 12px; display: flex; justify-content: space-between; align-items: center; }
        .pp-pages strong { font-size: 1.3rem; font-family: var(--font-serif-alt); }
        .pp-pages span { font-size: 0.8rem; font-weight: 600; }
        .pp-per-page { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; text-align: center; font-family: var(--font-mono); }
        .pp-print-mode { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-align: center; border-top: 1px solid var(--border-light); padding-top: 6px; font-family: var(--font-mono); }
        .pp-modal-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
        .pp-modal-preview div { border: 1px solid var(--border-light); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .pp-modal-preview strong { font-size: 1.2rem; font-family: var(--font-serif-alt); }
        .trial-confetti { font-size: 4rem; margin-bottom: 12px; animation: bounce 0.5s ease; }
        @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        @media (max-width: 900px) { .pp-header, .pp-grid { grid-template-columns: 1fr; } .pp-header { flex-direction: column; } .pp-name { font-family: var(--font-serif); } .pp-balance-num { font-family: var(--font-serif-alt); } .pp-trial-info h2 { font-family: var(--font-serif); } .pp-trial-card { flex-direction: column; text-align: center; align-items: center; } .pp-trial-card .btn { width: 100%; } .pp-trial-rules { justify-content: center; } .pp { overflow-x: hidden; } }
        @media (max-width: 640px) { .pp-modal-preview { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
