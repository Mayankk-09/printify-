"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const PACK_TYPE_LABELS: Record<string, string> = {
  BW_ONLY: "B&W Only",
  BW_AND_COLOR: "B&W & Color",
};

export default function SubscribePage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<any>(null);
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPacks);
    fetch("/api/subscriptions/mine")
      .then((r) => r.json())
      .then(setBalance)
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
      setCouponCode("");
      setCouponResult(null);
      setDiscountedTotal(null);
      const updated = await fetch("/api/subscriptions/mine").then((r) => r.json());
      setBalance(updated);
    } catch (err: any) {
      toast.error(err.message || "Unable to purchase");
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!selectedPack || !couponCode.trim()) return;
    setCouponLoading(true);
    setCouponResult(null);
    setDiscountedTotal(null);
    try {
      const res = await fetch("/api/payments/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode.trim(), baseAmount: selectedPack.price / 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coupon failed");
      setCouponResult(data);
      setDiscountedTotal(data.finalAmount);
      toast.success("PROMO APPLIED SUCCESS // ORDER RECALCULATED");
    } catch (err: any) {
      setCouponResult(null);
      setDiscountedTotal(null);
      toast.error(err.message || "Coupon validation failed");
    } finally {
      setCouponLoading(false);
    }
  };

  const remaining = balance?.remainingPages ?? 0;

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
                onClick={() => { setSelectedPack(pack); setCouponCode(""); setCouponResult(null); setDiscountedTotal(null); }}
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

            <div className="pp-coupon-bar">
              <input
                className="pp-coupon-input"
                type="text"
                placeholder="ENTER PROMO CODE"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponResult(null); setDiscountedTotal(null); }}
                maxLength={20}
              />
              <button
                className="pp-coupon-btn"
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? <div className="spinner" /> : "APPLY CODE // SECURE"}
              </button>
            </div>

            {couponResult && (
              <div className="pp-coupon-status">
                PROMO APPLIED SUCCESS // ORDER RECALCULATED
              </div>
            )}

            {discountedTotal !== null && (
              <div className="pp-discounted-row">
                <span>Discounted total</span>
                <strong>₹{discountedTotal.toFixed(2)}</strong>
              </div>
            )}

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
                {processing ? <div className="spinner" /> : `Pay ₹${discountedTotal !== null ? discountedTotal.toFixed(2) : (selectedPack.price / 100).toFixed(2)}`}
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
        .pp-coupon-bar { display: flex; gap: 0; border: 1px solid #000; background: #F9F9F6; margin-top: 12px; }
        .pp-coupon-input { flex: 1; padding: 12px 14px; border: none; border-right: 1px solid #000; background: transparent; font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; outline: none; text-transform: uppercase; }
        .pp-coupon-input::placeholder { color: var(--text-muted); }
        .pp-coupon-btn { padding: 12px 20px; border: none; background: var(--bg-black); color: #fff; font-family: var(--font-mono); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; cursor: pointer; text-transform: uppercase; white-space: nowrap; }
        .pp-coupon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pp-coupon-status { padding: 10px 14px; border: 1px solid #000; background: #F9F9F6; font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; margin-top: 8px; }
        .pp-discounted-row { display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid var(--border-primary); margin-top: 8px; font-weight: 800; font-size: 0.95rem; }
        .pp-discounted-row strong { color: var(--text-primary); }
        .pp-modal-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
        .pp-modal-preview div { border: 1px solid var(--border-light); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .pp-modal-preview strong { font-size: 1.2rem; font-family: var(--font-serif-alt); }
        @media (max-width: 900px) { .pp-header, .pp-grid { grid-template-columns: 1fr; } .pp-header { flex-direction: column; } .pp-name { font-family: var(--font-serif); } .pp-balance-num { font-family: var(--font-serif-alt); } .pp { overflow-x: hidden; } }
        @media (max-width: 640px) { .pp-modal-preview { grid-template-columns: 1fr; } .pp-coupon-bar { flex-direction: column; } .pp-coupon-input { border-right: none; border-bottom: 1px solid #000; } }
      `}</style>
    </div>
  );
}
