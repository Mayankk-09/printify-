import React from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: '◷' },
  { id: 'upload', label: 'Upload', icon: '↑' },
  { id: 'orders', label: 'Orders', icon: '☰' },
  { id: 'subscribe', label: 'Plan', icon: '◉' },
  { id: 'profile', label: 'Profile', icon: '○' }
];

const getPlanLabel = (subscription) => {
  if (!subscription || subscription.status !== 'active') return 'No active plan';
  return subscription.planName || 'Active plan';
};

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, subscription, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentTab('login');
  };

  const remaining = subscription ? Math.max(0, subscription.pagesAllowed - subscription.pagesUsed) : 0;
  const isStudent = user?.role === 'student';
  const isStaff = user?.role === 'admin' || user?.role === 'operator';

  const navigate = (tab) => {
    if (tab === 'orders') {
      setCurrentTab('dashboard');
    } else if (tab === 'profile') {
      setCurrentTab('subscribe');
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-inner">
          <button
            className="brand-btn"
            onClick={() => setCurrentTab(user ? (isStudent ? 'dashboard' : 'admin') : 'login')}
            type="button"
          >
            <span className="brand-mark">VP</span>
            <span className="brand-name">Printify</span>
          </button>

          {isStudent && (
            <div className="nav-links-desktop">
              <button className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')} type="button">Home</button>
              <button className={`nav-btn ${currentTab === 'upload' ? 'active' : ''}`} onClick={() => setCurrentTab('upload')} type="button">Upload</button>
              <button className={`nav-btn ${currentTab === 'subscribe' ? 'active' : ''}`} onClick={() => setCurrentTab('subscribe')} type="button">Plan</button>
            </div>
          )}

          {isStaff && (
            <div className="nav-links-desktop">
              <button className="nav-btn active" onClick={() => setCurrentTab('admin')} type="button">Console</button>
            </div>
          )}

          <div className="nav-actions">
            {user ? (
              <>
                {isStudent && (
                  <div className="pages-pill">
                    <span className="pages-count">{remaining}</span>
                    <span className="pages-label">pages left</span>
                  </div>
                )}
                <div className="user-chip">
                  <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <small>{isStudent ? getPlanLabel(subscription) : user.role}</small>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout} type="button">Sign out</button>
              </>
            ) : (
              <span className="nav-tagline">Campus printing</span>
            )}
          </div>
        </div>
      </nav>

      {isStudent && (
        <nav className="bottom-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = item.id === 'orders'
              ? currentTab === 'dashboard'
              : item.id === 'profile'
                ? currentTab === 'subscribe'
                : item.id === currentTab;
            return (
              <button
                key={item.id}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
                type="button"
              >
                <span className="bottom-nav-icon">{item.icon}</span>
                <span className="bottom-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <style>{`
        .main-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(7, 11, 20, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .navbar-inner {
          max-width: 1180px;
          margin: 0 auto;
          min-height: 64px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .brand-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          padding: 4px;
        }

        .brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-indigo), #6366f1);
          color: #ffffff;
          font-weight: 900;
          font-size: 0.75rem;
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25);
        }

        .brand-name {
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: -0.02em;
        }

        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-btn {
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 600;
          padding: 8px 13px;
          font-size: 0.88rem;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .nav-btn.active,
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          color: var(--text-primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pages-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 12px;
        }

        .pages-count {
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--accent-cyan);
        }

        .pages-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 10px;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(34, 211, 238, 0.14);
          color: var(--accent-cyan);
          font-weight: 900;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .user-info strong {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-info small {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .btn-sm {
          min-height: 32px;
          padding: 6px 12px;
          border-radius: 9px;
          font-size: 0.78rem;
        }

        .nav-tagline {
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .bottom-nav {
          display: none;
        }

        @media (max-width: 860px) {
          .navbar-inner {
            min-height: 56px;
            padding: 0 14px;
          }

          .nav-links-desktop,
          .pages-pill,
          .user-chip,
          .btn-sm {
            display: none;
          }

          .brand-name {
            font-size: 0.95rem;
          }

          .bottom-nav {
            position: fixed;
            left: 10px;
            right: 10px;
            bottom: 10px;
            z-index: 1200;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 2px;
            padding: 6px;
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            background: rgba(10, 16, 28, 0.96);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            box-shadow: var(--shadow-elevated);
          }

          .bottom-nav-item {
            border: 0;
            background: transparent;
            border-radius: 10px;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: 6px 2px;
            font-size: 0.62rem;
            font-weight: 600;
            transition: color var(--transition-fast), background var(--transition-fast);
          }

          .bottom-nav-item.active {
            background: rgba(139, 92, 246, 0.16);
            color: var(--text-primary);
          }

          .bottom-nav-icon {
            font-size: 1.05rem;
            line-height: 1;
          }

          .bottom-nav-label {
            font-size: 0.6rem;
            font-weight: 600;
            letter-spacing: 0.01em;
          }
        }

        @media (max-width: 860px) and (display-mode: standalone) {
          .bottom-nav {
            bottom: max(10px, env(safe-area-inset-bottom, 10px));
          }
        }
      `}</style>
    </>
  );
}
