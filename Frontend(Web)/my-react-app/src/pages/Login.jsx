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
        // DealChat needs this to tell "my" messages from the other party's.
        localStorage.setItem('userEmail', response.data.email || email)
        if (response.data.role) {
          localStorage.setItem('userRole', response.data.role)
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

  const quickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail)
    setPassword(rolePass)
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
          background: #f8fafc;
        }

        /* ── LEFT PANEL (Navy Brand Deep Slate) ── */
        .login-left {
          display: none;
          flex: 1;
          background: #0f172a;
          border-right: 1px solid #1e293b;
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .login-left { display: flex; } }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }
        .brand-icon {
          width: 44px; height: 44px;
          background: #10b981;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35);
        }
        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
        }

        .left-hero {
          position: relative;
          z-index: 1;
          max-width: 480px;
          border-left: 3px solid #10b981;
          padding-left: 20px;
        }
        .left-hero h1 {
          font-size: 34px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .left-hero p {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.6;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          position: relative;
          z-index: 1;
          border-top: 1px solid #1e293b;
          padding-top: 24px;
        }
        .stat-value {
          font-size: 20px;
          font-weight: 800;
          color: #10b981;
        }
        .stat-label {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* ── RIGHT PANEL (Off-White & Clean Card) ── */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #f8fafc;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 32px;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .login-card-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .login-card-header p {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
          margin-bottom: 24px;
        }

        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
        }
        .form-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: all 0.18s ease;
        }
        .form-input:focus {
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }

        .input-wrapper { position: relative; }
        .password-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: #94a3b8; cursor: pointer;
        }

        .submit-btn {
          width: 100%;
          height: 46px;
          background: #10b981;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          background: #059669;
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 20px;
        }

        .quick-switch {
          margin-top: 24px;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .quick-switch p {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .quick-switch-buttons {
          display: flex;
          gap: 8px;
        }
        .quick-btn {
          flex: 1;
          padding: 6px 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .quick-btn:hover {
          background: #ecfdf5;
          border-color: #10b981;
          color: #047857;
        }
      `}</style>

      <div className="login-root">
        {/* Left branding panel */}
        <div className="login-left">
          <div className="brand-logo">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div>
              <div className="brand-name">Nkoso</div>
              <div className="brand-sub">Fintech Marketplace Admin</div>
            </div>
          </div>

          <div className="left-hero">
            <h1>Ghanaian Marketplace Governance</h1>
            <p>
              Real-time administrative visibility over business pitch vetting, accredited investor capital commitments, and MFI legal workflows.
            </p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">GHS 4.2M+</div>
              <div className="stat-label">Capital Deployed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">18 MFIs</div>
              <div className="stat-label">Legal Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98.4%</div>
              <div className="stat-label">On-Time Repayment</div>
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <div className="flex items-center justify-between">
                <h2>Nkoso Admin Portal</h2>
                <button
                  type="button"
                  onClick={() => navigate('/presentation')}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#059669',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🌐 App Presentation →
                </button>
              </div>
              <p>Sign in to manage pitches, deals, and platform users</p>
            </div>

            {error && (
              <div className="error-box">
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
                    placeholder="admin@nkoso.gh"
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
                    className="form-input"
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
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign in to Admin Console'}
              </button>
            </form>

            {/* Quick Persona Switcher for Admin Testing */}
            <div className="quick-switch">
              <p>Quick Test Credentials</p>
              <div className="quick-switch-buttons">
                <button
                  type="button"
                  onClick={() => quickFill('admin@nkoso.gh', 'password123')}
                  className="quick-btn"
                >
                  Admin Role
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('mfi@fidelity.gh', 'password123')}
                  className="quick-btn"
                >
                  MFI Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login