import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const supportedExtensions = ['pdf', 'docx', 'pptx'];
const pickupSlots = ['9:00 - 10:00 AM', '12:00 - 1:00 PM', '3:00 - 4:00 PM'];
const addonPrices = {
  staple: 2,
  punchHoles: 1,
  cobraFile: 20,
  transparentFile: 10,
  folder: 15
};

const getTomorrow = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().slice(0, 10);
};

export default function UploadPrint({ setCurrentTab }) {
  const { token, subscription, refreshUser } = useAuth();
  const { addToast } = useNotifications();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [color, setColor] = useState('bw');
  const [copies, setCopies] = useState(1);
  const [side, setSide] = useState('single');
  const [pickupDate, setPickupDate] = useState(getTomorrow);
  const [pickupSlot, setPickupSlot] = useState(pickupSlots[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addons, setAddons] = useState({
    staple: false,
    punchHoles: false,
    cobraFile: false,
    transparentFile: false,
    folder: false
  });

  useEffect(() => { refreshUser(); }, []);

  const validate = (f) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!supportedExtensions.includes(ext)) return 'Only PDF, DOCX, and PPTX files are supported.';
    if (f.size > MAX_FILE_SIZE) return 'File size must be 15MB or less.';
    return '';
  };

  const uploadFile = async (selectedFile) => {
    const err = validate(selectedFile);
    if (err) { addToast(err, 'error'); return; }

    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(10);
    setFileDetails(null);

    const timer = window.setInterval(() => {
      setUploadProgress((p) => Math.min(85, p + 12));
    }, 200);

    const fd = new FormData();
    fd.append('file', selectedFile);

    try {
      const res = await fetch('/api/orders/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setFileDetails(data);
      setUploadProgress(100);
      addToast(`Uploaded ${data.fileName}. ${data.pages} pages detected.`, 'success');
    } catch (err) {
      setFile(null);
      setFileDetails(null);
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      window.clearInterval(timer);
      window.setTimeout(() => setUploading(false), 400);
    }
  };

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setFileDetails(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleAddon = (key) => setAddons((prev) => ({ ...prev, [key]: !prev[key] }));

  const addonCost = Object.entries(addons).reduce((s, [k, v]) => s + (v ? addonPrices[k] * copies : 0), 0);
  const pagesPerDoc = fileDetails?.pages || 0;
  const totalPagesNeeded = pagesPerDoc * copies;
  const remainingPages = subscription ? Math.max(0, subscription.pagesAllowed - subscription.pagesUsed) : 0;
  const pageBalanceOk = subscription && remainingPages >= totalPagesNeeded;
  const colorAllowed = color !== 'color' || subscription?.supportsColor;

  const handleSubmit = async () => {
    if (!fileDetails) { addToast('Upload a document first.', 'error'); return; }
    if (!subscription || subscription.status !== 'active') {
      addToast('An active subscription is required.', 'error');
      setCurrentTab('subscribe');
      return;
    }
    if (!colorAllowed) { addToast('Color requires the Hybrid Pro plan.', 'warning'); return; }
    if (!pageBalanceOk) {
      addToast(`Need ${totalPagesNeeded} pages, only ${remainingPages} left.`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fileName: fileDetails.fileName,
          filePath: fileDetails.filePath,
          pages: fileDetails.pages,
          color, copies, side, pickupDate, pickupSlot, addons
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order submission failed');
      setSuccess(true);
      addToast('Print order submitted!', 'success');
      await refreshUser();
      window.setTimeout(() => setCurrentTab('dashboard'), 1200);
    } catch (err) {
      addToast(err.message || 'Failed to submit', 'error');
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
          {['Select', 'Preview', 'Configure', 'Add-ons', 'Schedule', 'Submit'].map((s, i) => (
            <span key={s} className={`up-step ${(i === 0 && !fileDetails) || (i > 0 && fileDetails) ? 'active' : ''}`}>{s}</span>
          ))}
        </div>
      </div>

      <div className="up-layout">
        <div className="up-main">
          {/* Dropzone */}
          <div className="glass-card">
            <div className="sd-section-head">
              <h2>Select document</h2>
              <p className="text-secondary text-sm">PDF, DOCX, or PPTX up to 15MB.</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.pptx" onChange={handleFileInput} hidden />
            <div
              className={`up-dropzone ${dragActive ? 'active' : ''} ${fileDetails ? 'complete' : ''}`}
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
                  <strong>{dragActive ? 'Drop file' : 'Drag & drop'}</strong>
                  <span>or tap to browse</span>
                  {uploading && (
                    <div className="up-progress">
                      <div className="up-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <div className="up-file-preview">
                  <div className="up-file-badge">{fileDetails.fileName.split('.').pop()?.toUpperCase()}</div>
                  <div className="up-file-info">
                    <strong>{fileDetails.fileName}</strong>
                    <span>{fileDetails.pages} pages / {(file?.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                  <button type="button" className="up-file-remove" onClick={(e) => { e.stopPropagation(); clearFile(); }}>✕</button>
                </div>
              )}
            </div>
          </div>

          {/* Configure */}
          <div className="glass-card">
            <div className="sd-section-head">
              <h2>Configure</h2>
              <p className="text-secondary text-sm">Copies, print mode, and sides.</p>
            </div>
            <div className="up-config">
              <div className="form-group">
                <label className="form-label">Copies</label>
                <input className="form-input" type="number" min="1" max="10" value={copies} onChange={(e) => setCopies(Math.max(1, Math.min(10, Number(e.target.value))))} />
              </div>
              <div className="form-group">
                <label className="form-label">Print mode</label>
                <div className="segmented-control">
                  <button type="button" className={color === 'bw' ? 'active' : ''} onClick={() => setColor('bw')}>B&W</button>
                  <button type="button" className={color === 'color' ? 'active' : ''} onClick={() => setColor('color')}>Color</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sides</label>
                <div className="segmented-control">
                  <button type="button" className={side === 'single' ? 'active' : ''} onClick={() => setSide('single')}>Single</button>
                  <button type="button" className={side === 'double' ? 'active' : ''} onClick={() => setSide('double')}>Double</button>
                </div>
              </div>
            </div>
            {!colorAllowed && <div className="alert-card warning" style={{ marginTop: 8 }}>Color printing requires the Hybrid Pro plan.</div>}
          </div>

          {/* Add-ons */}
          <div className="glass-card">
            <div className="sd-section-head">
              <h2>Add-ons</h2>
              <p className="text-secondary text-sm">Optional finishing items. Charged per copy.</p>
            </div>
            <div className="up-addons">
              {[
                ['staple', 'Staple', 'Bind loose pages', '₹2'],
                ['punchHoles', 'Punch holes', 'File-ready sheets', '₹1'],
                ['cobraFile', 'Cobra file', 'Spring file', '₹20'],
                ['transparentFile', 'Clear cover', 'Transparent sleeve', '₹10'],
                ['folder', 'Card folder', 'Premium folder', '₹15']
              ].map(([key, title, desc, price]) => (
                <button key={key} className={`up-addon ${addons[key] ? 'selected' : ''}`} type="button" onClick={() => toggleAddon(key)}>
                  <span className="up-addon-toggle">{addons[key] ? '✓' : '+'}</span>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                  <span className="up-addon-price">{price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="up-side">
          {/* Pickup */}
          <div className="glass-card">
            <div className="sd-section-head"><h2>Pickup slot</h2></div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" min={getTomorrow()} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Slot</label>
              <select className="form-input" value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)}>
                {pickupSlots.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card active-glow">
            <div className="sd-section-head"><h2>Summary</h2></div>
            <div className="up-summary">
              <div><span>Pages</span><strong>{pagesPerDoc}</strong></div>
              <div><span>Copies</span><strong>{copies}</strong></div>
              <div><span>Total pages</span><strong>{totalPagesNeeded}</strong></div>
              <div><span>Balance</span><strong>{remainingPages}</strong></div>
              <div><span>Add-ons</span><strong>₹{addonCost}</strong></div>
            </div>

            {!subscription && <div className="alert-card error">Active subscription required.</div>}
            {subscription && !pageBalanceOk && fileDetails && <div className="alert-card error">Insufficient pages for this job.</div>}

            <button
              className="btn btn-primary w-100 mt-3"
              type="button"
              disabled={!fileDetails || submitting || !subscription || !pageBalanceOk || !colorAllowed}
              onClick={handleSubmit}
            >
              {submitting ? <div className="spinner" /> : 'Submit order'}
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

      <style>{`
        .up { display: flex; flex-direction: column; gap: 16px; }

        .up-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .up-head p { margin-top: 4px; }

        .up-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-width: 400px;
          justify-content: flex-end;
        }

        .up-step {
          border: 1px solid var(--border-glass);
          border-radius: 999px;
          color: var(--text-muted);
          background: rgba(255,255,255,0.04);
          padding: 6px 10px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .up-step.active {
          color: var(--text-primary);
          border-color: var(--border-active);
          background: rgba(139,92,246,0.14);
        }

        .sd-section-head h2 { font-size: 1rem; font-weight: 800; margin-bottom: 4px; }
        .sd-section-head p { margin-bottom: 12px; }

        .up-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 16px;
          align-items: start;
        }

        .up-main,
        .up-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .up-side { position: sticky; top: 84px; }

        .up-dropzone {
          min-height: 200px;
          border: 1px dashed rgba(148,163,184,0.35);
          border-radius: 16px;
          background: rgba(255,255,255,0.035);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          cursor: pointer;
          transition: border-color var(--transition-fast), background var(--transition-fast);
        }

        .up-dropzone.active,
        .up-dropzone:hover {
          border-color: var(--accent-cyan);
          background: rgba(34,211,238,0.06);
        }

        .up-dropzone.complete {
          align-items: stretch;
          padding: 14px;
          min-height: auto;
        }

        .up-drop-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(139,92,246,0.14);
          color: var(--accent-cyan);
          font-size: 1.2rem;
          font-weight: 900;
        }

        .up-dropzone > strong { font-size: 0.95rem; }
        .up-dropzone > span { color: var(--text-muted); font-size: 0.82rem; }

        .up-progress {
          width: min(280px, 80%);
          height: 6px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
          margin-top: 6px;
        }

        .up-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-cyan), var(--primary-indigo));
          transition: width 0.2s ease;
          border-radius: inherit;
        }

        .up-file-preview {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .up-file-badge {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(34,211,238,0.12);
          color: var(--accent-cyan);
          font-size: 0.7rem;
          font-weight: 900;
          flex-shrink: 0;
        }

        .up-file-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .up-file-info strong {
          font-size: 0.9rem;
          word-break: break-word;
        }

        .up-file-info span {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .up-file-remove {
          border: 1px solid var(--border-glass);
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
          border-radius: 9px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .up-config {
          display: grid;
          grid-template-columns: 0.6fr 1fr 1fr;
          gap: 12px;
          align-items: end;
        }

        .form-group { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
        .form-label { font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); }
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

        .up-addons {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .up-addon {
          min-height: 110px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          color: var(--text-primary);
          cursor: pointer;
          padding: 10px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color var(--transition-fast), background var(--transition-fast);
        }

        .up-addon.selected {
          border-color: var(--border-active);
          background: rgba(139,92,246,0.12);
        }

        .up-addon-toggle {
          color: var(--accent-cyan);
          font-size: 0.75rem;
          font-weight: 900;
        }

        .up-addon strong { font-size: 0.82rem; }
        .up-addon small { color: var(--text-muted); font-size: 0.7rem; line-height: 1.2; }
        .up-addon-price { color: var(--text-secondary); font-size: 0.75rem; font-weight: 700; margin-top: auto; }

        .up-summary {
          display: grid;
          gap: 8px;
        }

        .up-summary div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 8px;
        }

        .up-summary span { color: var(--text-muted); font-size: 0.82rem; }
        .up-summary strong { font-size: 0.92rem; }

        .up-success {
          margin-top: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px;
          border-radius: 12px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.25);
          animation: slideUp 0.3s ease both;
        }

        .up-success strong { color: #bbf7d0; }
        .up-success span { color: rgba(255,255,255,0.7); font-size: 0.82rem; }

        .mt-3 { margin-top: 12px; }

        @media (max-width: 960px) {
          .up-layout { grid-template-columns: 1fr; }
          .up-side { position: static; }
          .up-addons { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 720px) {
          .up-head { flex-direction: column; }
          .up-steps { justify-content: flex-start; }
          .up-config { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
