import { useState, useEffect } from 'react'
import api from '../api'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get('/users/me')
        setUser(response.data)
        setFormData({
          fullName: response.data.fullName || '',
          phone: response.data.phone || ''
        })
      } catch (err) {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await api.put('/users/me', formData)
      setUser(res.data)
      setSuccess('Profile updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your account details and verifications.</p>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm ${
          error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error || success}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-500 bg-slate-50 cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="cta-button">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Verifications</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Ghana Card</p>
              <p className="text-sm text-slate-500">Legal identity verification</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.ghanaCardVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {user.ghanaCardVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">MTN Mobile Money</p>
              <p className="text-sm text-slate-500">Linked for payments</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.momoVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {user.momoVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
