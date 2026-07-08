"use client";
/* cspell:ignore beforeinstallprompt */

import { useState, useEffect, useRef } from "react";

let deferredPrompt: any = null;

export default function PwaPrompt() {
  const [android, setAndroid] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const promptRef = useRef(deferredPrompt);

  useEffect(() => {
    if (dismissed) return;
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafariIos = isIos && /safari/i.test(ua) && !/crios|ios|opios/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;

    if (standalone) {
      setDismissed(true);
      return;
    }

    if (isAndroid) {
      setAndroid(true);
    } else if (isSafariIos) {
      const seen = sessionStorage.getItem("printify_pwa_ios_seen");
      if (!seen) {
        setShowIosSheet(true);
      }
    }
  }, [dismissed]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      promptRef.current = e;
      if (android) setShowAndroidBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [android]);

  const handleInstall = () => {
    const p = deferredPrompt || promptRef.current;
    if (!p) return;
    p.prompt();
    p.userChoice.then(() => {
      deferredPrompt = null;
      promptRef.current = null;
      setShowAndroidBanner(false);
      setDismissed(true);
    });
  };

  const dismissIos = () => {
    sessionStorage.setItem("printify_pwa_ios_seen", "1");
    setShowIosSheet(false);
    setDismissed(true);
  };

  if (!showAndroidBanner && !showIosSheet) return null;

  return (
    <>
      {showAndroidBanner && (
        <div className="pwa-android-banner">
          <span className="pwa-android-text">+ ADD TO WORKSPACE</span>
          <button className="pwa-android-btn" onClick={handleInstall} type="button">
            Install
          </button>
          <button
            className="pwa-android-close"
            onClick={() => { setShowAndroidBanner(false); setDismissed(true); }}
            type="button"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      {showIosSheet && (
        <div className="pwa-ios-backdrop" onClick={dismissIos}>
          <div className="pwa-ios-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-handle" />
            <div className="pwa-ios-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
            </div>
            <p className="pwa-ios-title">Add to Home Screen</p>
            <p className="pwa-ios-desc">
              TO ACCESS PRINTIFY INSTANTLY FROM YOUR WORKSPACE, TAP THE SHARE ICON BELOW AND
              SELECT "ADD TO HOME SCREEN".
            </p>
            <button className="pwa-ios-dismiss" onClick={dismissIos} type="button">
              Got it
            </button>
          </div>
        </div>
      )}
      <style>{`
        .pwa-android-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #000;
          color: #fff;
          border-top: 1px solid rgba(255,255,255,0.1);
          animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .pwa-android-text {
          flex: 1;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pwa-android-btn {
          border: 1px solid #fff;
          background: transparent;
          color: #fff;
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 8px 16px;
          cursor: pointer;
          transition: background 0.12s;
        }
        .pwa-android-btn:hover { background: rgba(255,255,255,0.1); }
        .pwa-android-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 1rem;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }
        .pwa-android-close:hover { color: #fff; }

        .pwa-ios-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: rgba(0,0,0,0.4);
          animation: fadeIn 0.2s ease both;
        }
        .pwa-ios-sheet {
          width: 100%;
          max-width: 400px;
          background: #fff;
          padding: 12px 28px 36px;
          text-align: center;
          border-radius: 16px 16px 0 0;
          animation: slideUp 0.35s cubic-bezier(0.4,0,0.2,1) both;
        }
        .pwa-ios-handle {
          width: 36px;
          height: 4px;
          background: #ddd;
          border-radius: 2px;
          margin: 0 auto 16px;
        }
        .pwa-ios-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #000;
          border-radius: 12px;
        }
        .pwa-ios-title {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #000;
        }
        .pwa-ios-desc {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          line-height: 1.6;
          color: #666;
          margin-bottom: 20px;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }
        .pwa-ios-dismiss {
          border: 1px solid #000;
          background: #000;
          color: #fff;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 12px 32px;
          cursor: pointer;
          transition: opacity 0.12s;
        }
        .pwa-ios-dismiss:hover { opacity: 0.85; }
      `}</style>
    </>
  );
}
