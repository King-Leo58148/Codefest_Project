import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const accessToken = response.data.accessToken || response.data.token
      const refreshToken = response.data.refreshToken || response.data.refresh_token

      localStorage.setItem('accesstoken', accessToken)
      if (refreshToken) localStorage.setItem('refreshtoken', refreshToken)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('token')

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)

      if (err?.response) {
        const status = err.response.status
        const message = err.response.data?.error || err.response.data?.message

        if (status === 401 || status === 403) {
          setError(message || 'Invalid email or password. Make sure you have admin access.')
        } else {
          setError(message || `Login failed with status ${status}.`)
        }
      } else if (err?.request) {
        setError('Unable to reach the server. Please check your backend and network connection.')
      } else {
        setError('An unexpected error occurred while signing in.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 overflow-hidden rounded-[2rem] bg-slate-900/90 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr]">
        <div className="relative px-8 py-10 sm:px-12 sm:py-14">
          <div className="absolute inset-y-0 right-0 w-full bg-amber-400/10 blur-3xl opacity-70"></div>
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 shadow-inner shadow-slate-950/10">
              <span>Nkɔso</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Manage your platform with clarity.
            </h1>
            <p className="max-w-xl text-slate-300 sm:text-lg">
              Admin tools for pitches, deals, repayments, and user oversight in a modern dashboard layout.
            </p>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                <p className="font-semibold text-white">Fast approvals</p>
                <p className="mt-2 text-slate-300">Review new pitches, sign deals, and approve repayments faster.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                <p className="font-semibold text-white">Clear overview</p>
                <p className="mt-2 text-slate-300">See key metrics and activity at a glance as soon as you sign in.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">Admin sign in</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Enter your admin details to access the control panel.</p>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-slate-900">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-900">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 rounded-3xl bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Need help?</p>
            <p className="mt-2">If you cannot sign in, confirm that your credentials are correct and your account has admin access.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login