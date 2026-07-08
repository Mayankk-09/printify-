"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"enter" | "exit" | "gone">("enter");

  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem("printify_splash_seen"); } catch {}
    if (seen) {
      setPhase("gone");
      return;
    }

    const t1 = setTimeout(() => setPhase("exit"), 1100);
    const t2 = setTimeout(() => {
      setPhase("gone");
      try { sessionStorage.setItem("printify_splash_seen", "1"); } catch {}
    }, 1900);
    const t3 = setTimeout(() => setPhase("gone"), 3000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`splash-overlay ${phase === "exit" ? "splash-exit" : ""}`}>
      <span className="splash-mark">PRINTIFY.</span>
      <style>{`
        .splash-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .splash-overlay.splash-exit {
          animation: splashSlideUp 0.8s cubic-bezier(0.85, 0, 0.15, 1) forwards;
        }
        .splash-mark {
          font-family: 'Playfair Display', 'Times New Roman', serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #fff;
          animation: splashReveal 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .splash-exit .splash-mark {
          animation: splashReveal 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     splashHoldScale 0.6s 0.5s ease forwards;
        }
        @keyframes splashReveal {
          0% { opacity: 0; filter: blur(8px); transform: scale(0.95); }
          100% { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        @keyframes splashHoldScale {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }
        @keyframes splashSlideUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
