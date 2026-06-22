"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Select from "@/components/Select";
import { getSlotOptions } from "@/lib/slots";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const supportedExtensions = ["pdf", "docx", "pptx"];
const slotOptions = getSlotOptions();

const PAGE_PRICE_BW = 5;
const PAGE_PRICE_COLOR = 10;

const ADDON_LABELS: Record<string, { label: string; desc: string }> = {
  staple: { label: "Staple", desc: "Bind loose pages" },
  punchHoles: { label: "Punch holes", desc: "File-ready sheets" },
  cobraFile: { label: "Cobra file", desc: "Spring file" },
  transparentFile: { label: "Clear cover", desc: "Transparent sleeve" },
  folder: { label: "Card folder", desc: "Premium folder" },
};

const ADDON_KEYS = ["staple", "punchHoles", "cobraFile", "transparentFile", "folder"];

function getTomorrow() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().slice(0, 10);
}

export default function UploadPrintClient({ subscription }: { subscription: any }) {
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
  const [pickupDate, setPickupDate] = useState(getTomorrow);
  const [pickupSlot, setPickupSlot] = useState(slotOptions[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addons, setAddons] = useState<Record<string, boolean>>(
    Object.fromEntries(ADDON_KEYS.map((k) => [k, false]))
  );
  const [paymentModal, setPaymentModal] = useState<{
    show: boolean;
    amount: number;
    pageCost: number;
    addonCost: number;
    chargeablePages: number;
    excessPages: number;
    coveredBySub: number;
    totalPagesNeeded: number;
  } | null>(null);
  const [addonPrices, setAddonPrices] = useState<Record<string, number>>({
    staple: 2,
    punchHoles: 1,
    cobraFile: 20,
    transparentFile: 10,
    folder: 15,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const prices: Record<string, number> = { ...addonPrices };
          for (const s of data.settings) {
            if (s.key in prices) {
              prices[s.key] = parseFloat(s.value) || prices[s.key];
            }
          }
          setAddonPrices(prices);
        }
      })
      .catch(() => {});
  }, []);

  const hasSubscription = subscription?.status === "active";
  const remainingPages = hasSubscription
    ? Math.max(0, subscription.pagesAllowed - subscription.pagesUsed)
    : 0;

  const validate = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !supportedExtensions.includes(ext)) return "Only PDF, DOCX, and PPTX files are supported.";
    if (f.size > MAX_FILE_SIZE) return "File size must be 15MB or less.";
    return "";
  };

  const uploadFile = async (selectedFile: File) => {
    const err = validate(selectedFile);
    if (err) {
      toast.error(err);
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(10);
    setFileDetails(null);

    const timer = window.setInterval(() => {
      setUploadProgress((p) => Math.min(85, p + 12));
    }, 200);

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
      toast.success(`Uploaded ${data.fileName}. ${data.pages} pages detected.`);
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

  const toggleAddon = (key: string) => setAddons((prev) => ({ ...prev, [key]: !prev[key] }));

  const numCopies = Number(copies) || 0;
  const pagesPerDoc = fileDetails?.pages || 0;
  const totalPagesNeeded = pagesPerDoc * numCopies;

  const addonCost = ADDON_KEYS.reduce(
    (s, k) => s + (addons[k] ? (addonPrices[k] || 0) * numCopies : 0),
    0
  );

  const pagePrice = color === "color" ? PAGE_PRICE_COLOR : PAGE_PRICE_BW;
  let coveredBySub = 0;
  let excessPages = totalPagesNeeded;
  if (hasSubscription) {
    if (totalPagesNeeded <= remainingPages) {
      coveredBySub = totalPagesNeeded;
      excessPages = 0;
    } else {
      coveredBySub = remainingPages;
      excessPages = totalPagesNeeded - remainingPages;
    }
  }
  const chargeablePages = excessPages;
  const pageCost = chargeablePages * pagePrice;
  const totalAmount = pageCost + addonCost;
  const requiresPayment = totalAmount > 0;

  const handleSubmit = async () => {
    if (!fileDetails) {
      toast.error("Upload a document first.");
      return;
    }

    const orderData = {
      fileName: fileDetails.fileName,
      filePath: fileDetails.filePath,
      fileSize: fileDetails.fileSize,
      pages: fileDetails.pages,
      printMode: color === "color" ? "COLOR" : "BW",
      copies: numCopies,
      printSide: side === "double" ? "DOUBLE" : "SINGLE",
      pickupDate,
      pickupSlot,
      addons,
    };

    if (!requiresPayment) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderData, paymentConfirmed: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order creation failed");
        setSuccess(true);
        toast.success("Order submitted!");
        window.setTimeout(() => router.push("/dashboard"), 1200);
      } catch (err: any) {
        toast.error(err.message || "Failed to submit");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setPaymentModal({
      show: true,
      amount: totalAmount,
      pageCost,
      addonCost,
      chargeablePages,
      excessPages,
      coveredBySub,
      totalPagesNeeded,
    });
  };

  const handleMockPayment = async () => {
    if (!fileDetails) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileDetails.fileName,
          filePath: fileDetails.filePath,
          fileSize: fileDetails.fileSize,
          pages: fileDetails.pages,
          printMode: color === "color" ? "COLOR" : "BW",
          copies: numCopies,
          printSide: side === "double" ? "DOUBLE" : "SINGLE",
          pickupDate,
          pickupSlot,
          addons,
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="up fade-in">
      <div className="up-head">
        <div>
          <span className="eyebrow">Upload</span>
          <h1 className="page-title">New print order</h1>
          <p className="text-secondary">Select, configure, and submit your document for printing.</p>
        </div>
        <div className="up-steps">
          {["Select", "Preview", "Configure", "Add-ons", "Schedule", "Submit"].map((s, i) => (
            <span
              key={s}
              className={`up-step ${(i === 0 && !fileDetails) || (i > 0 && fileDetails) ? "active" : ""}`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="up-layout">
        <div className="up-main">
          <div className="glass-card">
            <div className="sd-section-head">
              <h2>Select document</h2>
              <p className="text-secondary text-sm">PDF, DOCX, or PPTX up to 15MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleFileInput}
              hidden
            />
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
                  <span>or tap to browse</span>
                  {uploading && (
                    <div className="up-progress">
                      <div className="up-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <div className="up-file-preview">
                  <div className="up-file-badge">
                    {fileDetails.fileName.split(".").pop()?.toUpperCase()}
                  </div>
                  <div className="up-file-info">
                    <strong>{fileDetails.fileName}</strong>
                    <span>
                      {fileDetails.pages} pages / {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <button type="button" className="up-file-remove" onClick={(e) => { e.stopPropagation(); clearFile(); }}>✕</button>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card">
            <div className="sd-section-head">
              <h2>Configure</h2>
              <p className="text-secondary text-sm">Copies, print mode, and sides.</p>
            </div>
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
            <div className="sd-section-head">
              <h2>Add-ons</h2>
              <p className="text-secondary text-sm">Optional finishing items. Charged per copy.</p>
            </div>
            <div className="up-addons">
              {ADDON_KEYS.map((key) => (
                <button
                  key={key}
                  className={`up-addon ${addons[key] ? "selected" : ""}`}
                  type="button"
                  onClick={() => toggleAddon(key)}
                >
                  <span className="up-addon-toggle">{addons[key] ? "✓" : "+"}</span>
                  <strong>{ADDON_LABELS[key]?.label || key}</strong>
                  <small>{ADDON_LABELS[key]?.desc || ""}</small>
                  <span className="up-addon-price">₹{addonPrices[key] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="up-side">
          <div className="glass-card">
            <div className="sd-section-head">
              <h2>Pickup slot</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" min={getTomorrow()} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Slot</label>
              <Select value={pickupSlot} onChange={setPickupSlot} options={slotOptions} />
            </div>
          </div>

          <div className="glass-card active-glow">
            <div className="sd-section-head">
              <h2>Summary</h2>
            </div>
            <div className="up-summary">
              <div>
                <span>Pages</span>
                <strong>{pagesPerDoc}</strong>
              </div>
              <div>
                <span>Copies</span>
                <strong>{copies}</strong>
              </div>
              <div>
                <span>Total pages</span>
                <strong>{totalPagesNeeded}</strong>
              </div>
              {hasSubscription && (
                <div>
                  <span>Plan pages left</span>
                  <strong>{remainingPages}</strong>
                </div>
              )}
              <div>
                <span>Add-ons</span>
                <strong>₹{addonCost}</strong>
              </div>
            </div>

            {!hasSubscription && fileDetails && (
              <div className="alert-card info">
                Pay-per-print: ₹{PAGE_PRICE_BW}/page B&W, ₹{PAGE_PRICE_COLOR}/page Color.
              </div>
            )}

            <button
              className="btn btn-primary w-100 mt-3"
              type="button"
              disabled={!fileDetails || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <div className="spinner" />
              ) : requiresPayment ? (
                `Pay \u20B9${totalAmount.toFixed(2)}`
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
        <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Complete payment</h3>
            <p className="text-secondary text-sm">Payment required for excess pages and add-ons.</p>

            <div className="pay-breakdown">
              {paymentModal.coveredBySub > 0 && (
                <div>
                  <span>Covered by plan</span>
                  <strong>{paymentModal.coveredBySub} pages</strong>
                </div>
              )}
              {paymentModal.excessPages > 0 && (
                <div>
                  <span>Chargeable pages</span>
                  <strong>{paymentModal.excessPages} pages</strong>
                </div>
              )}
              {paymentModal.pageCost > 0 && (
                <div>
                  <span>Page cost</span>
                  <strong>₹{paymentModal.pageCost.toFixed(2)}</strong>
                </div>
              )}
              {paymentModal.addonCost > 0 && (
                <div>
                  <span>Add-on cost</span>
                  <strong>₹{paymentModal.addonCost.toFixed(2)}</strong>
                </div>
              )}
              <div className="pay-total">
                <span>Total</span>
                <strong>₹{paymentModal.amount.toFixed(2)}</strong>
              </div>
            </div>

            <p className="text-secondary text-sm" style={{ marginBottom: 0 }}>
              Mock payment — no real gateway configured.
            </p>

            <div className="pay-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setPaymentModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" disabled={submitting} onClick={handleMockPayment}>
                {submitting ? <div className="spinner" /> : `Mock Pay — ₹${paymentModal.amount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .up { display: flex; flex-direction: column; gap: 16px; }
        .up-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .up-head p { margin-top: 4px; }
        .up-steps { display: flex; flex-wrap: wrap; gap: 6px; max-width: 400px; justify-content: flex-end; }
        .up-step { border: 1px solid var(--border-glass); border-radius: 999px; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 6px 10px; font-size: 0.7rem; font-weight: 700; }
        .up-step.active { color: var(--text-primary); border-color: var(--border-active); background: rgba(139,92,246,0.14); }
        .sd-section-head h2 { font-size: 1rem; font-weight: 800; margin-bottom: 4px; }
        .sd-section-head p { margin-bottom: 12px; }
        .up-layout { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
        .up-main, .up-side { display: flex; flex-direction: column; gap: 16px; }
        .up-side { position: sticky; top: 84px; }
        .up-dropzone { min-height: 200px; border: 1px dashed rgba(148,163,184,0.35); border-radius: 16px; background: rgba(255,255,255,0.035); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; cursor: pointer; transition: border-color var(--transition-fast), background var(--transition-fast); }
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
        .up-addons { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .up-addon { min-height: 110px; border: 1px solid var(--border-glass); border-radius: 12px; background: rgba(255,255,255,0.04); color: var(--text-primary); cursor: pointer; padding: 10px; text-align: left; display: flex; flex-direction: column; gap: 4px; transition: border-color var(--transition-fast), background var(--transition-fast); }
        .up-addon.selected { border-color: var(--border-active); background: rgba(139,92,246,0.12); }
        .up-addon-toggle { color: var(--accent-cyan); font-size: 0.75rem; font-weight: 900; }
        .up-addon strong { font-size: 0.82rem; }
        .up-addon small { color: var(--text-muted); font-size: 0.7rem; line-height: 1.2; }
        .up-addon-price { color: var(--text-secondary); font-size: 0.75rem; font-weight: 700; margin-top: auto; }
        .up-summary { display: grid; gap: 8px; }
        .up-summary div { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px; }
        .up-summary span { color: var(--text-muted); font-size: 0.82rem; }
        .up-summary strong { font-size: 0.92rem; }
        .up-success { margin-top: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 12px; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25); animation: slideUp 0.3s ease both; }
        .up-success strong { color: #bbf7d0; }
        .up-success span { color: rgba(255,255,255,0.7); font-size: 0.82rem; }
        .mt-3 { margin-top: 12px; }
        .alert-card.info { border: 1px solid rgba(34,211,238,0.25); background: rgba(34,211,238,0.08); color: var(--accent-cyan); border-radius: 10px; padding: 10px 14px; font-size: 0.8rem; }

        @media (max-width: 960px) { .up-layout { grid-template-columns: 1fr; } .up-side { position: static; } .up-addons { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 720px) { .up-head { flex-direction: column; } .up-steps { justify-content: flex-start; } .up-config { grid-template-columns: 1fr; } }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
        .modal-content { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 28px; max-width: 420px; width: 100%; box-shadow: 0 24px 48px rgba(0,0,0,0.4); }
        .modal-content h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; }
        .pay-breakdown { margin: 16px 0; display: grid; gap: 8px; }
        .pay-breakdown div { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px; font-size: 0.85rem; }
        .pay-breakdown span { color: var(--text-muted); }
        .pay-total { border-bottom: none !important; border-top: 2px solid var(--border-glass); padding-top: 8px; font-weight: 800; font-size: 1rem !important; }
        .pay-total strong { color: var(--accent-cyan); }
        .pay-actions { display: flex; gap: 10px; margin-top: 16px; }
        .pay-actions .btn { flex: 1; }
      `}</style>
    </div>
  );
}
