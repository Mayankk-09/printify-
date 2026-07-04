"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { getEarliestPickupDate, getAvailableDates, formatDate, formatDateFull, getSlotLabel } from "@/lib/pickup";
import { PAGE_PRICE_BW, PAGE_PRICE_COLOR, calculateOrderCost, formatPrice } from "@/lib/pricing";
import type { PickupSlot } from "@/lib/pickup";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const supportedExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];

export default function UploadPrintClient({
  subscriptions,
  totalAllowed,
  totalUsed,
  user,
  initialAddons,
  initialPacks,
  initialPickupSettings,
}: {
  subscriptions: any[];
  totalAllowed: number;
  totalUsed: number;
  user?: any;
  initialAddons: any[];
  initialPacks: any[];
  initialPickupSettings: any;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [color, setColor] = useState("bw");
  const [copies, setCopies] = useState("1");
  const [side, setSide] = useState("single");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; amount: number; breakdown: any } | null>(null);
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  const [addons, setAddons] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [pickupSettings, setPickupSettings] = useState<any>(null);

  useEffect(() => {
    setAddons(initialAddons);
    setPacks(initialPacks);
    fetch("/api/users/me").then((r) => r.json()).then((userData) => {
      if (userData) setUserData(userData);
    }).catch(() => {});

    setPickupSettings(initialPickupSettings);
    const earliest = getEarliestPickupDate(initialPickupSettings.cutoffTime);
    const dates = getAvailableDates(earliest, initialPickupSettings.maxAdvanceDays, initialPickupSettings.workingDays);
    setAvailableDates(dates);
    setPickupSlots(initialPickupSettings.slots);
    if (dates.length > 0) {
      setSelectedDate(dates[0].toISOString().slice(0, 10));
    }
    if (initialPickupSettings.slots.length > 0) {
      setSelectedSlot(initialPickupSettings.slots[0].value);
    }
  }, [initialAddons, initialPacks, initialPickupSettings]);

  const remainingPages = Math.max(0, totalAllowed - totalUsed);
  const hasPack = totalAllowed > 0;
  const firstSub = subscriptions[0];
  const packType = firstSub?.pack?.packType || null;
  const hasClaimedTrial = userData?.hasClaimedTrial ?? false;
  const hasUsedTrial = userData?.hasUsedTrial ?? false;
  const trialActive = hasClaimedTrial && !hasUsedTrial;

  const validate = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !supportedExtensions.includes(ext)) return "Only PDF, DOC, DOCX, PPT, and PPTX files are supported.";
    if (f.size > MAX_FILE_SIZE) return "File size must be 15MB or less.";
    return "";
  };

  const uploadFile = async (selectedFile: File) => {
    const err = validate(selectedFile);
    if (err) { toast.error(err); return; }

    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(10);
    setFileDetails(null);

    const timer = window.setInterval(() => setUploadProgress((p) => Math.min(85, p + 12)), 200);

    const fd = new FormData();
    fd.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.user?.id}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFileDetails(data);
      setUploadProgress(100);
      if (data.pageCountPending) {
        toast.success(`Uploaded. ${data.warning || "Page count will be verified."}`);
      } else {
        toast.success(`Uploaded. ${data.pages} pages detected.`);
      }
    } catch (err: any) {
      setFile(null);
      setFileDetails(null);
      toast.error(err.message || "Upload failed");
    } finally {
      window.clearInterval(timer);
      window.setTimeout(() => setUploading(false), 400);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setFileDetails(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const numCopies = Number(copies) || 1;
  const pagesPerDoc = fileDetails?.pages || 0;
  const printablePages = pagesPerDoc * numCopies;

  const activeAddons = addons.filter((a) => selectedAddonIds.includes(a.id));
  const addonPrices = activeAddons.map((a) => ({ price: a.price, quantity: numCopies }));
  const trialMaxPagesSetting = 5;
const isTrialEligible = trialActive && color === "bw" && printablePages <= trialMaxPagesSetting && addonPrices.length === 0;

  const costResult = calculateOrderCost({
    pages: pagesPerDoc,
    copies: numCopies,
    printMode: color === "color" ? "COLOR" : "BW",
    addonPrices,
    remainingPackPages: remainingPages,
    packType,
    isTrialEligible,
    trialMaxPages: trialMaxPagesSetting,
  });

  const { breakdown, chargeablePages, coveredByPack, isTrialUsed: trialUsed } = costResult;

  const packCoversColor = packType === "BW_AND_COLOR";
  const colorBlocked = hasPack && packType === "BW_ONLY" && color === "color";

  const showUpsell = !hasPack && !trialActive && fileDetails && !upsellDismissed && printablePages > 0 && breakdown.grandTotal > 0;

  const handleSubmit = async () => {
    if (!fileDetails) { toast.error("Upload a document first."); return; }
    if (colorBlocked) { toast.error("Your current pack only supports black & white printing."); return; }

    const orderPayload: Record<string, any> = {
      fileName: fileDetails.fileName,
      filePath: fileDetails.filePath,
      fileSize: fileDetails.fileSize,
      pages: pagesPerDoc,
      copies: numCopies,
      printablePages,
      printMode: color === "color" ? "COLOR" : "BW",
      printSide: side === "double" ? "DOUBLE" : "SINGLE",
      pickupDate: selectedDate,
      pickupSlot: selectedSlot,
      addonIds: selectedAddonIds,
    };

    if (trialUsed || (!breakdown.grandTotal && hasPack)) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderPayload, paymentConfirmed: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order creation failed");
        setSuccess(true);
        toast.success("Order submitted!");
        window.setTimeout(() => router.push("/dashboard"), 1200);
      } catch (err: any) {
        toast.error(err.message || "Failed to submit");
      } finally { setSubmitting(false); }
      return;
    }

    if (breakdown.grandTotal > 0) {
      setPaymentModal({ show: true, amount: breakdown.grandTotal, breakdown });
    }
  };

  const handlePayNow = async () => {
    if (!fileDetails || !paymentModal) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileDetails.fileName,
          filePath: fileDetails.filePath,
          fileSize: fileDetails.fileSize,
          pages: pagesPerDoc,
          copies: numCopies,
          printablePages,
          printMode: color === "color" ? "COLOR" : "BW",
          printSide: side === "double" ? "DOUBLE" : "SINGLE",
          pickupDate: selectedDate,
          pickupSlot: selectedSlot,
          addonIds: selectedAddonIds,
          paymentConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      setPaymentModal(null);
      setSuccess(true);
      toast.success("Payment successful! Order submitted.");
      window.setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally { setSubmitting(false); }
  };

  const bestPackUpsell = packs.length > 0 ? packs.reduce((best, p) =>
    p.pages > best.pages ? p : best, packs[0]) : null;

  return (
    <div className="up fade-in">
      <div className="up-head">
        <div>
          <span className="eyebrow">Upload</span>
          <h1 className="page-title">New print order</h1>
          <p className="text-secondary">Upload, configure, and submit your document.</p>
        </div>
      </div>

      <div className="up-layout">
        <div className="up-main">
          <div className="glass-card">
            <h2 className="up-section-title">Document</h2>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.pptx,.doc,.ppt" onChange={handleFileInput} hidden />
            <div
              className={`up-dropzone ${dragActive ? "active" : ""} ${fileDetails ? "complete" : ""}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
            >
              {!fileDetails ? (
                <>
                  <div className="up-drop-icon">↑</div>
                  <strong>{dragActive ? "Drop file" : "Drag & drop"}</strong>
                  <span>or tap to browse — PDF, DOC, DOCX, PPT, PPTX</span>
                  {uploading && (
                    <div className="up-progress">
                      <div className="up-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <div className="up-file-preview">
                  <div className="up-file-badge">{fileDetails.fileName.split(".").pop()?.toUpperCase()}</div>
                  <div className="up-file-info">
                    <strong>{fileDetails.fileName}</strong>
                    <span>{fileDetails.pages} pages / {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB</span>
                    <span className="text-sm text-muted">Printable pages: {printablePages} ({pagesPerDoc} × {numCopies})</span>
                    {fileDetails.pageCountPending && (
                      <span style={{ fontSize: "0.7rem", color: "#fbbf24" }}>Page count pending — will be verified</span>
                    )}
                  </div>
                  <button type="button" className="up-file-remove" onClick={(e) => { e.stopPropagation(); clearFile(); }}>✕</button>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card">
            <h2 className="up-section-title">Configure</h2>
            <div className="up-config">
              <div className="form-group">
                <label className="form-label">Copies</label>
                <input className="form-input" type="number" min={1} max={10} value={copies} onChange={(e) => setCopies(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Print mode</label>
                <div className="segmented-control">
                  <button type="button" className={color === "bw" ? "active" : ""} onClick={() => setColor("bw")}>B&W</button>
                  <button type="button" className={color === "color" ? "active" : ""} onClick={() => setColor("color")}>Color</button>
                </div>
                {colorBlocked && (
                  <span style={{ color: "#fb7185", fontSize: "0.75rem", marginTop: 4, display: "block" }}>
                    Your pack only supports B&W printing.
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Sides</label>
                <div className="segmented-control">
                  <button type="button" className={side === "single" ? "active" : ""} onClick={() => setSide("single")}>Single</button>
                  <button type="button" className={side === "double" ? "active" : ""} onClick={() => setSide("double")}>Double</button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h2 className="up-section-title">Add-ons</h2>
            {addons.length === 0 ? (
              <p className="text-secondary text-sm">No add-ons available.</p>
            ) : (
              <div className="up-addons">
                {addons.map((addon) => (
                  <button
                    key={addon.id}
                    className={`up-addon ${selectedAddonIds.includes(addon.id) ? "selected" : ""}`}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    disabled={!addon.active}
                  >
                    <span className="up-addon-toggle">{selectedAddonIds.includes(addon.id) ? "✓" : "+"}</span>
                    <strong>{addon.name}</strong>
                    {addon.description && <small>{addon.description}</small>}
                    <span className="up-addon-price">{addon.price === 0 ? "FREE" : `₹${(addon.price / 100).toFixed(2)}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="up-side">
          <div className="glass-card">
            <h2 className="up-section-title">Pickup</h2>
            <div className="up-pickup-dates">
              {availableDates.map((date) => {
                const dateStr = date.toISOString().slice(0, 10);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={`up-date-card ${isSelected ? "selected" : ""}`}
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlot(""); }}
                  >
                    <span className="up-date-day">{formatDate(date).split(",")[0]}</span>
                    <span className="up-date-num">{date.getDate()}</span>
                    <span className="up-date-month">{date.toLocaleString("default", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
            {selectedDate && pickupSlots.length > 0 && (
              <div className="up-slot-list">
                {pickupSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    className={`up-slot-btn ${selectedSlot === slot.value ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(slot.value)}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
            {selectedDate && selectedSlot && (
              <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                Pickup: {formatDateFull(new Date(selectedDate))} — {getSlotLabel(pickupSlots, selectedSlot)}
              </p>
            )}
          </div>

          {showUpsell && bestPackUpsell && (
            <div className="glass-card up-upsell">
              <div className="up-upsell-icon">📦</div>
              <h3>Save with a pack</h3>
              <p className="text-secondary text-sm">
                Buying the {bestPackUpsell.name} would reduce the cost of this order.
              </p>
              <div className="up-upsell-compare">
                <div>
                  <span>Current order</span>
                  <strong>{formatPrice(breakdown.grandTotal)}</strong>
                </div>
                <div>
                  <span>{bestPackUpsell.name}</span>
                  <strong>{formatPrice(bestPackUpsell.price)}</strong>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link href="/subscribe" className="btn btn-primary" style={{ flex: 1, textAlign: "center", fontSize: "0.82rem" }}>
                  Buy Pack
                </Link>
                <button className="btn btn-secondary" onClick={() => setUpsellDismissed(true)} type="button" style={{ fontSize: "0.82rem" }}>
                  Skip
                </button>
              </div>
            </div>
          )}

          <div className={`glass-card ${fileDetails ? "active-glow" : ""}`}>
            <h2 className="up-section-title">Summary</h2>
            {!fileDetails ? (
              <div className="up-summary-empty">
                <p className="text-secondary text-sm">Upload a document to see pricing.</p>
              </div>
            ) : (
              <div className="up-summary">
                <div><span>Document cost</span><strong>{formatPrice(breakdown.documentCost)}</strong></div>
                {breakdown.packDiscount < 0 && (
                  <div className="up-saved"><span>Pack covers</span><strong>{formatPrice(Math.abs(breakdown.packDiscount))}</strong></div>
                )}
                {breakdown.extraCharge > 0 && (
                  <div><span>Extra charge ({chargeablePages} pages)</span><strong>{formatPrice(breakdown.extraCharge)}</strong></div>
                )}
                {breakdown.addonCost > 0 && (
                  <div><span>Add-ons ({numCopies}×)</span><strong>{formatPrice(breakdown.addonCost)}</strong></div>
                )}
                <div className="up-total"><span>Total</span><strong>{formatPrice(breakdown.grandTotal)}</strong></div>
              </div>
            )}

            {hasPack && (
              <div className="up-pack-info">
                <span>Pack: {firstSub?.pack?.name}</span>
                <span>{remainingPages} pages remaining</span>
              </div>
            )}

            {colorBlocked && (
              <div className="alert-card" style={{ borderColor: "rgba(251,113,133,0.25)", background: "rgba(251,113,133,0.08)", color: "#fb7185", borderRadius: 10, padding: "10px 14px", fontSize: "0.8rem", marginTop: 12 }}>
                Your pack only supports black-and-white printing. Switch to B&W or buy a B&W+Color pack.
              </div>
            )}

            <button
              className="btn btn-primary w-100 mt-3"
              type="button"
              disabled={!fileDetails || submitting || colorBlocked || !selectedSlot}
              onClick={handleSubmit}
            >
              {submitting ? (
                <div className="spinner" />
              ) : !fileDetails ? (
                "Upload a document"
              ) : trialUsed ? (
                "Submit (Free Trial)"
              ) : breakdown.grandTotal > 0 ? (
                `Pay ${formatPrice(breakdown.grandTotal)}`
              ) : (
                "Submit Order"
              )}
            </button>

            {success && (
              <div className="up-success">
                <div className="success-check">✓</div>
                <strong>Order submitted!</strong>
                <span>Redirecting to dashboard...</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {paymentModal?.show && (
        <div className="modal-backdrop">
          <div className="glass-card modal-card" style={{ maxWidth: 440 }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 className="font-black">Payment</h2>
              <button className="btn btn-ghost" onClick={() => setPaymentModal(null)} type="button">✕</button>
            </div>
            <p className="text-secondary text-sm" style={{ marginBottom: 16 }}>Review your order summary.</p>
            <div className="pay-breakdown">
              <div><span>Document cost</span><strong>{formatPrice(paymentModal.breakdown.documentCost)}</strong></div>
              {paymentModal.breakdown.packDiscount < 0 && (
                <div><span>Pack discount</span><strong style={{ color: "#34d399" }}>{formatPrice(paymentModal.breakdown.packDiscount)}</strong></div>
              )}
              {paymentModal.breakdown.extraCharge > 0 && (
                <div><span>Extra charge</span><strong>{formatPrice(paymentModal.breakdown.extraCharge)}</strong></div>
              )}
              {paymentModal.breakdown.addonCost > 0 && (
                <div><span>Add-ons</span><strong>{formatPrice(paymentModal.breakdown.addonCost)}</strong></div>
              )}
              <div className="pay-total"><span>Grand total</span><strong>{formatPrice(paymentModal.amount)}</strong></div>
            </div>
            <div className="pay-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setPaymentModal(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" disabled={submitting} onClick={handlePayNow} style={{ flex: 1 }}>
                {submitting ? <div className="spinner" /> : `Pay ${formatPrice(paymentModal.amount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .up { display: flex; flex-direction: column; gap: 16px; }
        .up-head { margin-bottom: 4px; }
        .up-head p { margin-top: 4px; }
        .up-section-title { font-size: 1rem; font-weight: 800; margin-bottom: 12px; }
        .up-layout { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
        .up-main, .up-side { display: flex; flex-direction: column; gap: 16px; }
        .up-side { position: sticky; top: 84px; }
        .up-dropzone { min-height: 180px; border: 1px dashed rgba(148,163,184,0.35); border-radius: 16px; background: rgba(255,255,255,0.035); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; cursor: pointer; transition: border-color var(--transition-fast), background var(--transition-fast); }
        .up-dropzone.active, .up-dropzone:hover { border-color: var(--accent-cyan); background: rgba(34,211,238,0.06); }
        .up-dropzone.complete { align-items: stretch; padding: 14px; min-height: auto; }
        .up-drop-icon { width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: rgba(139,92,246,0.14); color: var(--accent-cyan); font-size: 1.2rem; font-weight: 900; }
        .up-dropzone > strong { font-size: 0.95rem; }
        .up-dropzone > span { color: var(--text-muted); font-size: 0.82rem; }
        .up-progress { width: min(280px, 80%); height: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; margin-top: 6px; }
        .up-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary-indigo)); transition: width 0.2s ease; border-radius: inherit; }
        .up-file-preview { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; text-align: left; }
        .up-file-badge { width: 46px; height: 46px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(34,211,238,0.12); color: var(--accent-cyan); font-size: 0.7rem; font-weight: 900; flex-shrink: 0; }
        .up-file-info { display: flex; flex-direction: column; min-width: 0; }
        .up-file-info strong { font-size: 0.9rem; word-break: break-word; }
        .up-file-info span { font-size: 0.78rem; color: var(--text-muted); }
        .up-file-remove { border: 1px solid var(--border-glass); background: rgba(255,255,255,0.06); color: var(--text-primary); border-radius: 9px; padding: 6px 10px; cursor: pointer; font-size: 0.75rem; }
        .up-config { display: grid; grid-template-columns: 0.6fr 1fr 1fr; gap: 12px; align-items: end; }
        .up-addons { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
        .up-addon { min-height: 100px; border: 1px solid var(--border-glass); border-radius: 12px; background: rgba(255,255,255,0.04); color: var(--text-primary); cursor: pointer; padding: 10px; text-align: left; display: flex; flex-direction: column; gap: 4px; transition: border-color var(--transition-fast), background var(--transition-fast); }
        .up-addon.selected { border-color: var(--border-active); background: rgba(139,92,246,0.12); }
        .up-addon-toggle { color: var(--accent-cyan); font-size: 0.75rem; font-weight: 900; }
        .up-addon strong { font-size: 0.82rem; }
        .up-addon small { color: var(--text-muted); font-size: 0.7rem; line-height: 1.2; }
        .up-addon-price { color: var(--text-secondary); font-size: 0.75rem; font-weight: 700; margin-top: auto; }
        .up-pickup-dates { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .up-date-card { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 10px; border: 1px solid var(--border-glass); border-radius: 10px; background: rgba(255,255,255,0.04); cursor: pointer; min-width: 60px; transition: all var(--transition-fast); }
        .up-date-card.selected { border-color: var(--primary-indigo); background: rgba(139,92,246,0.12); }
        .up-date-card:hover { border-color: var(--border-active); }
        .up-date-day { font-size: 0.6rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
        .up-date-num { font-size: 1.1rem; font-weight: 800; }
        .up-date-month { font-size: 0.7rem; color: var(--text-secondary); }
        .up-slot-list { display: flex; flex-direction: column; gap: 4px; }
        .up-slot-btn { padding: 8px 12px; border: 1px solid var(--border-glass); border-radius: 8px; background: rgba(255,255,255,0.04); cursor: pointer; text-align: left; font-size: 0.82rem; transition: all var(--transition-fast); }
        .up-slot-btn.selected { border-color: var(--primary-indigo); background: rgba(139,92,246,0.12); color: var(--text-primary); font-weight: 700; }
        .up-slot-btn:hover { border-color: var(--border-active); }
        .up-summary-empty { padding: 16px 0; text-align: center; }
        .up-summary-empty p { margin: 0; }
        .up-summary { display: grid; gap: 8px; }
        .up-summary div { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-glass); padding-bottom: 6px; font-size: 0.85rem; }
        .up-summary span { color: var(--text-muted); }
        .up-summary strong { font-size: 0.9rem; }
        .up-saved strong { color: #34d399; }
        .up-total { border-bottom: none !important; border-top: 2px solid var(--border-glass); padding-top: 8px; margin-top: 4px; font-weight: 800; }
        .up-total strong { color: var(--accent-cyan); font-size: 1.1rem; }
        .up-pack-info { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); padding: 8px 0; border-bottom: 1px solid var(--border-glass); margin-bottom: 4px; }
        .up-upsell { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.04); }
        .up-upsell-icon { font-size: 2rem; text-align: center; margin-bottom: 4px; }
        .up-upsell h3 { font-size: 0.95rem; font-weight: 800; margin-bottom: 4px; }
        .up-upsell-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
        .up-upsell-compare div { border: 1px solid var(--border-glass); border-radius: 8px; padding: 8px; text-align: center; }
        .up-upsell-compare span { font-size: 0.7rem; color: var(--text-muted); display: block; }
        .up-upsell-compare strong { font-size: 1rem; }
        .up-success { margin-top: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 12px; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25); animation: slideUp 0.3s ease both; }
        .up-success strong { color: #bbf7d0; }
        .up-success span { color: rgba(255,255,255,0.7); font-size: 0.82rem; }
        .mt-3 { margin-top: 12px; }
        .pay-breakdown { display: grid; gap: 8px; }
        .pay-breakdown div { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px; font-size: 0.85rem; }
        .pay-breakdown span { color: var(--text-muted); }
        .pay-total { border-bottom: none !important; border-top: 2px solid var(--border-glass); padding-top: 8px; font-weight: 800; font-size: 1rem !important; }
        .pay-total strong { color: var(--accent-cyan); }
        .pay-actions { display: flex; gap: 10px; margin-top: 16px; }
        @media (max-width: 960px) { .up-layout { grid-template-columns: 1fr; } .up-side { position: static; } }
        @media (max-width: 720px) { .up-config { grid-template-columns: 1fr; } .up-addons { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
