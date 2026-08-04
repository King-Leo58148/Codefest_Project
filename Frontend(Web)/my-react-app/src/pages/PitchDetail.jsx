import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MapPin, ArrowLeft, Calendar, BadgeCheck } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'
import BorderBeam from '../components/magic/BorderBeam'

function PitchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pitch, setPitch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [bidding, setBidding] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState('')
  const [bidSuccess, setBidSuccess] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role)

    async function fetchPitch() {
      try {
        const response = await api.get(`/api/pitches/${id}`)
        setPitch(response.data)
      } catch (err) {
        setError('Failed to load pitch details.')
      } finally {
        setLoading(false)
      }
    }
    fetchPitch()
  }, [id])

  const handlePlaceBid = async (e) => {
    e.preventDefault()
    setBidding(true)
    setBidError('')
    
    try {
      await api.post('/api/bids', {
        pitchId: parseInt(id),
        amount: parseFloat(bidAmount)
      })
      setBidSuccess('Your investment bid has been placed successfully!')
      setBidAmount('')
      setTimeout(() => navigate('/my-bids'), 3000)
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message || ''
      if (serverMsg.toLowerCase().includes('verification') || serverMsg.includes('Please complete verification process')) {
        setBidError('Please complete verification process.')
      } else {
        setBidError(err.response?.data?.error || err.response?.data?.message || 'Failed to place bid.')
      }
    } finally {
      setBidding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center flex-col gap-3">
        <div className="spinner" />
        <p className="text-slate-400 text-sm">Loading pitch details...</p>
      </div>
    )
  }

  if (error || !pitch) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Pitch Not Found</h3>
        <p className="text-slate-500 mb-6">{error || 'This pitch does not exist or has been removed.'}</p>
        <button onClick={() => navigate(-1)} className="pill-button">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <BlurFade delay={0}>
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
      </BlurFade>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {pitch.industry || 'General'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <MapPin size={14} />
                    {pitch.location || 'Location Not Specified'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {pitch.status}
                  </span>
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 mb-2">{pitch.businessName}</h1>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">About the Business</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{pitch.description}</p>
              
              <div className="my-8 h-px bg-slate-100"></div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Purpose of Funds</h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-slate-700 italic">"{pitch.purpose}"</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Owner Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-lg border border-slate-200">
                {pitch.ownerName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-slate-900">{pitch.ownerName}</p>
                <div className="mt-1">
                  <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">Identity Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Funding Goal</p>
              <h2 className="text-3xl font-semibold text-slate-900">
                GH₵ {pitch.amountNeeded?.toLocaleString()}
              </h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{pitch.createdAt ? new Date(pitch.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-500">Platform Fee</p>
                <p className="font-medium text-slate-900">1%</p>
              </div>
            </div>

            {userRole === 'INVESTOR' && pitch.status === 'APPROVED' && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4">Make an Investment</h3>
                
                {bidSuccess && (
                  <div className="mb-4 bg-green-50 text-green-700 border border-green-200 p-3 rounded-xl text-sm">
                    {bidSuccess}
                  </div>
                )}
                
                {bidError && (
                  <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-sm">
                    {bidError}
                  </div>
                )}
                
                <form onSubmit={handlePlaceBid}>
                  <div className="mb-4">
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-500 font-medium">GH₵</span>
                      <input
                        type="number"
                        required
                        min="100"
                        step="100"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={bidding} className="cta-button w-full">
                    {bidding ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-3">
                    By placing a bid, you agree to our Terms of Investment.
                  </p>
                </form>
              </div>
            )}
            
            {userRole !== 'INVESTOR' && (
              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  {userRole === 'BUSINESS_OWNER' ? 'This is how investors see your pitch.' : 'Only investors can place bids.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PitchDetail
