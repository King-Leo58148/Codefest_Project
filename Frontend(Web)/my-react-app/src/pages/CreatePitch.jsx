import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function CreatePitch() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    amountNeeded: '',
    purpose: '',
    description: '',
  })

  const [files, setFiles] = useState({
    businessRegistration: null,
    financialStatements: null,
  })

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field, e) => {
    setFiles((prev) => ({ ...prev, [field]: e.target.files[0] }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/pitches', formData)
      const pitchId = response.data.id

      if (files.businessRegistration || files.financialStatements) {
        const docData = new FormData()
        if (files.businessRegistration) docData.append('registration', files.businessRegistration)
        if (files.financialStatements) docData.append('financials', files.financialStatements)
        
        await api.post(`/api/pitches/${pitchId}/documents`, docData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).catch(err => {
          console.warn('Document upload failed but pitch was created', err)
        })
      }

      setStep(3)
    } catch (err) {
      console.error('Failed to create pitch', err)
      setError('Failed to create pitch. Please check your inputs and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Create a New Pitch</h2>
        <p className="text-slate-500 text-sm mt-1">Submit your business for funding on the Nkɔso platform.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 rounded-full flex-1 ${i <= step ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Business Details</h3>

          <form onSubmit={handleNext} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => updateForm('businessName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => updateForm('industry', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 bg-white"
                >
                  <option value="">Select an industry...</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Technology">Technology</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Needed (GH₵)</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={formData.amountNeeded}
                  onChange={(e) => updateForm('amountNeeded', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Funds</label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => updateForm('purpose', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => updateForm('description', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="cta-button">
                Next Step
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Supporting Documents</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <label className="block text-sm font-medium text-slate-900 mb-1 cursor-pointer">
                Business Registration Certificate
                <input
                  type="file"
                  className="block w-full mt-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('businessRegistration', e)}
                />
              </label>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <label className="block text-sm font-medium text-slate-900 mb-1 cursor-pointer">
                Financial Statements (Last 6 Months)
                <input
                  type="file"
                  className="block w-full mt-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                  accept=".pdf,.csv,.xlsx"
                  onChange={(e) => handleFileChange('financialStatements', e)}
                />
              </label>
            </div>

            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="pill-button">
                Back
              </button>
              <button type="submit" disabled={loading} className="cta-button">
                {loading ? 'Submitting...' : 'Submit Pitch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">Pitch Submitted!</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Your pitch is now pending admin review. You will be notified once it is approved and goes live for investors.
          </p>
          <button onClick={() => navigate('/my-pitches')} className="cta-button">
            View My Pitches
          </button>
        </div>
      )}
    </div>
  )
}

export default CreatePitch
