import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        navigate('/dashboard')
      } else {
        setError('Login failed: Invalid response from server')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: #0f1117;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          display: none;
          flex: 1;
          background: linear-gradient(145deg, #0c1426 0%, #0f2847 45%, #0d1f3c 100%);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .login-left { display: flex; } }

        /* decorative blobs */
        .login-left::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(16,185,129,.18) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -140px; left: -80px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(59,130,246,.14) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }
        .brand-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-icon svg { width: 24px; height: 24px; }
        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .brand-sub {
          font-size: 11px;
          color: #6ee7b7;
          font-weight: 500;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .left-hero {
          position: relative;
          z-index: 1;
        }
        .left-hero h1 {
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.18;
          letter-spacing: -0.8px;
          margin-bottom: 20px;
        }
        .left-hero h1 span {
          background: linear-gradient(90deg, #10b981, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-hero p {
          font-size: 16px;
          color: #94a3b8;
          line-height: 1.65;
          max-width: 380px;
        }

        .stats-row {
          display: flex;
          gap: 32px;
          position: relative;
          z-index: 1;
        }
        .stat-item {}
        .stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 500;
        }

        /* glass cards floating in background — repositioned so they no longer sit under the hero text */
        .glass-cards {
          position: absolute;
          top: 90px;
          right: -40px;
          width: 300px;
          pointer-events: none;
          z-index: 0;
        }
        .glass-card-float {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          padding: 20px 24px;
          backdrop-filter: blur(8px);
          margin-bottom: 14px;
        }
        .gc-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .gc-value { font-size: 20px; font-weight: 700; color: #e2e8f0; }
        .gc-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(16,185,129,.15);
          color: #10b981;
          margin-top: 6px;
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          flex: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 48px 24px;
        }
        @media (min-width: 900px) { .login-right { max-width: 560px; } }

        .login-card {
          width: 100%;
          max-width: 420px;
        }

        .login-card-header {
          margin-bottom: 40px;
        }

        /* mobile logo (visible on small screens only) */
        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo .brand-icon { width: 36px; height: 36px; border-radius: 10px; }
        .mobile-logo .brand-name { font-size: 18px; }

        .login-card-header h2 {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .login-card-header p {
          font-size: 14px;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          letter-spacing: 0.1px;
        }
        .input-wrapper {
          position: relative;
        }
        .form-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          font-family: 'Inter', sans-serif;
        }
        .form-input:focus {
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(16,185,129,.1);
        }
        .form-input::placeholder { color: #94a3b8; }
        .form-input.password-input { padding-right: 48px; }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s;
        }
        .password-toggle:hover { color: #475569; }

        .error-box {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 12px;
          padding: 13px 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #dc2626;
          font-weight: 500;
        }
        .error-dot {
          width: 8px; height: 8px;
          background: #ef4444;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.1px;
          transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(16,185,129,.35);
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16,185,129,.4);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .btn-spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
        }
        .admin-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid #d1fae5;
          margin-top: 12px;
        }
        .chip-dot {
          width: 6px; height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className="login-root">
        {/* Left branding panel */}
        <div className="login-left">
          <div className="brand-logo">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div>
              <div className="brand-name">Nkoso</div>
              <div className="brand-sub">Admin Portal</div>
            </div>
          </div>

          {/* Floating glass cards */}
          <div className="glass-cards">
            <div className="glass-card-float">
              <div className="gc-label">Platform Volume</div>
              <div className="gc-value">GH₵ 2.4M</div>
              <div className="gc-badge">↑ 18.3% this month</div>
            </div>
            <div className="glass-card-float">
              <div className="gc-label">Active Deals</div>
              <div className="gc-value">142 Investments</div>
              <div className="gc-badge">↑ 24 new this week</div>
            </div>
          </div>

          <div className="left-hero">
            <h1>
              Empowering<br />
              <span>African Business</span><br />
              Growth
            </h1>
            <p>
              The Nkoso admin portal gives you full visibility and control over pitches, investments, deals, and users across the platform.
            </p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">2,400+</div>
              <div className="stat-label">Businesses funded</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">GH₵40M+</div>
              <div className="stat-label">Capital deployed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">Repayment rate</div>
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="login-right">
          <div className="login-card">
            {/* Mobile logo */}
            <div className="mobile-logo">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div className="brand-name">Nkoso</div>
            </div>

            <div className="login-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to your admin account to continue</p>
            </div>

            {error && (
              <div className="error-box">
                <div className="error-dot" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="admin@nkoso.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input password-input"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign in to Admin Portal'
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>This portal is restricted to authorized administrators only.</p>
              <div className="admin-chip">
                <div className="chip-dot" />
                Secured with JWT Authentication
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login