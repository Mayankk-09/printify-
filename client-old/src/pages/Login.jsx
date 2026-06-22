import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Login({ setCurrentTab }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminAccessPassword, setAdminAccessPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('BCA');
  const [year, setYear] = useState('1st Year');
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const { addToast } = useNotifications();

  const handleDemoLogin = async (demoRole) => {
    setSubmitting(true);
    try {
      if (demoRole === 'admin') {
        await login('admin@college.edu', 'admin123', 'admin', 'mayanklodu');
        addToast('Admin console unlocked.', 'success');
        setCurrentTab('admin');
        return;
      }

      const demoEmail = 'student@vips.edu';
      const demoPassword = 'student123';
      try {
        await signup({
          name: 'Demo Student',
          email: demoEmail,
          phone: '9999988888',
          course: 'B.Tech CSE',
          year: '3rd Year',
          password: demoPassword
        });
      } catch {
        await login(demoEmail, demoPassword, 'student');
      }
      addToast('Signed in as demo student.', 'success');
      setCurrentTab('dashboard');
    } catch (err) {
      addToast(err.message || 'Demo login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const loggedInUser = await login(email, password, role, adminAccessPassword);
        addToast(`Welcome back, ${loggedInUser.name}.`, 'success');
        setCurrentTab(loggedInUser.role === 'student' ? 'dashboard' : 'admin');
      } else {
        await signup({ name, email, phone, course, year, password });
        addToast('Account created successfully.', 'success');
        setCurrentTab('dashboard');
      }
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page fade-in">
      <div className="login-layout">
        <section className="login-hero">
          <div className="login-brand">VP</div>
          <h1>Print coursework, skip the queue.</h1>
          <p className="login-hero-text">Upload documents, track pickup status, manage monthly pages, and unlock print room operations from one dashboard.</p>
          <div className="login-tags">
            <span>PDF</span>
            <span>DOCX</span>
            <span>PPTX</span>
            <span>QR Pickup</span>
          </div>
        </section>

        <section className="glass-card login-card slide-up">
          <div className="login-toggle">
            <button type="button" className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign in</button>
            <button type="button" className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isLogin && (
              <div className="role-selector">
                <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
                <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <select className="form-select" value={course} onChange={(e) => setCourse(e.target.value)}>
                      <option>BCA</option>
                      <option>B.Tech CSE</option>
                      <option>BBA</option>
                      <option>BJMC</option>
                      <option>BA LLB</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>5th Year</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@college.edu" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
            </div>

            {isLogin && role === 'admin' && (
              <div className="form-group">
                <label className="form-label">Admin access password</label>
                <input
                  type="password"
                  className="form-input"
                  value={adminAccessPassword}
                  onChange={(e) => setAdminAccessPassword(e.target.value)}
                  required
                  placeholder="Required for admin access"
                />
              </div>
            )}

            <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
              {submitting ? <div className="spinner" /> : (isLogin ? 'Continue' : 'Create account')}
            </button>
          </form>

          <div className="demo-row">
            <button type="button" onClick={() => handleDemoLogin('student')} disabled={submitting}>Demo student</button>
            <button type="button" onClick={() => handleDemoLogin('admin')} disabled={submitting}>Demo admin</button>
          </div>
        </section>
      </div>

      <style>{`
        .login-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
        }

        .login-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .login-hero {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 540px;
        }

        .login-brand {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-indigo), #6366f1);
          color: #fff;
          font-weight: 900;
          font-size: 0.85rem;
          box-shadow: 0 16px 40px rgba(139, 92, 246, 0.28);
        }

        .login-hero h1 {
          font-size: clamp(2rem, 5vw, 3.6rem);
          line-height: 0.98;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .login-hero-text {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.7;
        }

        .login-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .login-tags span {
          border: 1px solid var(--border-glass);
          border-radius: 999px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.04);
          padding: 7px 12px;
          font-weight: 600;
          font-size: 0.78rem;
        }

        .login-card {
          padding: 24px;
        }

        .login-toggle,
        .role-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
          padding: 4px;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          margin-bottom: 16px;
        }

        .toggle-btn,
        .role-selector button,
        .demo-row button {
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          padding: 9px;
          font-weight: 700;
          font-size: 0.85rem;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .toggle-btn.active,
        .role-selector button.active {
          background: rgba(139, 92, 246, 0.18);
          color: var(--text-primary);
        }

        .login-form {
          display: flex;
          flex-direction: column;
        }

        .form-group {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-input,
        .form-select {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 11px 13px;
          color: var(--text-primary);
          font-size: 0.92rem;
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          width: 100%;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: var(--primary-indigo);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .demo-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border-glass);
        }

        .demo-row button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.82rem;
        }

        .demo-row button:hover {
          background: rgba(255, 255, 255, 0.09);
        }

        @media (max-width: 860px) {
          .login-layout {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 16px 0 96px;
          }

          .login-hero h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
