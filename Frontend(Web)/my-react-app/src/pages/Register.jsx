import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'BUSINESS_OWNER',
    ghanaCardNumber: '',
    momoNumber: ''
  })

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      })

      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })
      const accessToken = loginRes.data.accessToken || loginRes.data.token
      localStorage.setItem('accesstoken', accessToken)
      localStorage.setItem('userRole', formData.role)
      
      setStep(2)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyGhanaCard = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/verify-ghana-card', { ghanaCardNumber: formData.ghanaCardNumber })
      setStep(3)
    } catch (err) {
      setError('Ghana Card verification failed. Please check the number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyMoMo = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/verify-momo', { momoNumber: formData.momoNumber })
      navigate('/dashboard')
    } catch (err) {
      setError('MoMo verification failed. Please check the number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const skipVerification = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            {step === 1 ? 'Create an account' : step === 2 ? 'Verify Identity' : 'Verify MoMo'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {step === 1 ? 'Join the Nkɔso platform today.' : step === 2 ? 'Link your Ghana Card for legal compliance.' : 'Link your MTN Mobile Money account for payments.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => updateForm('role', 'BUSINESS_OWNER')}
                className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition ${
                  formData.role === 'BUSINESS_OWNER' 
                    ? 'border-slate-900 bg-slate-900 text-white' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Business Owner
              </button>
              <button
                type="button"
                onClick={() => updateForm('role', 'INVESTOR')}
                className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition ${
                  formData.role === 'INVESTOR' 
                    ? 'border-slate-900 bg-slate-900 text-white' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Investor
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => updateForm('fullName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => updateForm('password', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button type="submit" disabled={loading} className="cta-button w-full mt-4">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyGhanaCard} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghana Card Number</label>
              <input
                type="text"
                required
                value={formData.ghanaCardNumber}
                onChange={(e) => updateForm('ghanaCardNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="GHA-XXXXXXXXX-X"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={loading} className="cta-button w-full">
                {loading ? 'Verifying...' : 'Verify Identity'}
              </button>
              <button type="button" onClick={skipVerification} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Skip for now
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyMoMo} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MTN MoMo Number</label>
              <input
                type="tel"
                required
                value={formData.momoNumber}
                onChange={(e) => updateForm('momoNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={loading} className="cta-button w-full">
                {loading ? 'Verifying...' : 'Verify MoMo & Finish'}
              </button>
              <button type="button" onClick={skipVerification} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Skip for now
              </button>
            </div>
          </form>
        )}
      </div>

      {step === 1 && (
        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}

export default Register
