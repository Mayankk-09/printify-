import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const toastMeta = {
  success: { icon: '✓', label: 'Success' },
  error: { icon: '✕', label: 'Error' },
  warning: { icon: '⚠', label: 'Warning' },
  info: { icon: 'ℹ', label: 'Info' }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((prev) => [...prev, { id, message, type: toastMeta[type] ? type : 'info' }]);

    const timer = window.setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timer);
    return id;
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ addToast, removeToast }}>
      {children}

      <div className="toast-container" aria-live="polite" aria-relevant="additions removals">
        {notifications.map((toast) => {
          const meta = toastMeta[toast.type] || toastMeta.info;
          return (
            <div key={toast.id} className={`toast-card toast-${toast.type}`} role="status">
              <div className="toast-icon" aria-hidden="true">{meta.icon}</div>
              <div className="toast-content">
                <strong>{meta.label}</strong>
                <span>{toast.message}</span>
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)} type="button" aria-label="Close notification">✕</button>
            </div>
          );
        })}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: min(380px, calc(100vw - 24px));
          pointer-events: none;
        }

        .toast-card {
          pointer-events: auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: start;
          gap: 12px;
          border-radius: 14px;
          border: 1px solid;
          padding: 14px 16px;
          box-shadow: var(--shadow-elevated);
          animation: toastIn 0.25s ease both;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .toast-success {
          background: #065f46;
          border-color: #34d399;
        }

        .toast-success .toast-content strong,
        .toast-success .toast-content span {
          color: #ffffff;
        }

        .toast-error {
          background: #7f1d1d;
          border-color: #f87171;
        }

        .toast-error .toast-content strong,
        .toast-error .toast-content span {
          color: #ffffff;
        }

        .toast-warning {
          background: #78350f;
          border-color: #fbbf24;
        }

        .toast-warning .toast-content strong,
        .toast-warning .toast-content span {
          color: #ffffff;
        }

        .toast-info {
          background: #1e3a5f;
          border-color: #60a5fa;
        }

        .toast-info .toast-content strong,
        .toast-info .toast-content span {
          color: #ffffff;
        }

        .toast-icon {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 900;
          flex-shrink: 0;
        }

        .toast-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          line-height: 1.35;
          min-width: 0;
        }

        .toast-content strong {
          font-size: 0.82rem;
          font-weight: 800;
        }

        .toast-content span {
          font-size: 0.88rem;
          opacity: 0.95;
        }

        .toast-close {
          border: 0;
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background var(--transition-fast);
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 860px) {
          .toast-container {
            left: 12px;
            right: 12px;
            bottom: 80px;
            width: auto;
          }

          .toast-card {
            padding: 12px 14px;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};
