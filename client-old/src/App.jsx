import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import UploadPrint from './pages/UploadPrint';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AdminDashboard from './pages/AdminDashboard';
import './styles/app.css';

const normalizeTab = (tab) => {
  if (tab === 'orders' || tab === 'profile') return 'dashboard';
  return tab || 'login';
};

const getTabFromHash = () => {
  const hashTab = window.location.hash.replace('#', '');
  const normalized = normalizeTab(hashTab);
  const allowedTabs = ['login', 'dashboard', 'upload', 'subscribe', 'admin'];
  return allowedTabs.includes(normalized) ? normalized : 'login';
};

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTabState] = useState(getTabFromHash);

  const setCurrentTab = (tab) => {
    const normalized = normalizeTab(tab);
    setCurrentTabState(normalized);
    if (window.location.hash !== `#${normalized}`) {
      window.location.hash = normalized;
    }
  };

  useEffect(() => {
    const handleHashChange = () => setCurrentTabState(getTabFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCurrentTab('login');
      return;
    }

    if (user.role === 'admin' || user.role === 'operator') {
      setCurrentTab('admin');
      return;
    }

    const protectedTabs = ['dashboard', 'upload', 'subscribe'];
    if (!protectedTabs.includes(currentTab) || currentTab === 'login') {
      setCurrentTab('dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner spinner-lg" />
        <p>Restoring your session...</p>
        <style>{`
          .app-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: var(--text-secondary);
            background: var(--bg-deep);
          }
        `}</style>
      </div>
    );
  }

  const isStudent = user?.role === 'student';

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="container main-content-wrapper">
        {currentTab === 'login' && <Login setCurrentTab={setCurrentTab} />}
        {currentTab === 'dashboard' && isStudent && <StudentDashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'upload' && isStudent && <UploadPrint setCurrentTab={setCurrentTab} />}
        {currentTab === 'subscribe' && isStudent && <SubscriptionPlans setCurrentTab={setCurrentTab} />}
        {currentTab === 'admin' && (user?.role === 'admin' || user?.role === 'operator') && <AdminDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
