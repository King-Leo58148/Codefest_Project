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
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminRefreshToken', response.data.refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password. Make sure you have admin access.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-100 shadow-sm p-10 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nkɔso Admin</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to your admin account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 text-sm"
              placeholder="admin@gmail.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login