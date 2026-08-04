import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { FileText, CheckCircle, XCircle, Clock, CheckCheck, Search } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'

function PitchReview() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('search') || ''

  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    async function fetchPitches() {
      try {
        const response = await api.get('/api/admin/pitches/pending')
        const data = response.data
        setPitches(Array.isArray(data) ? data : [])
      } catch (err) {
        setError('Failed to load pitches.')
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [])

  async function handleApprove(id) {
    try {
      await api.put(`/api/admin/pitches/${id}/approve`)
      setPitches(pitches.filter((p) => p.id !== id))
    } catch (err) {
      alert('Failed to approve pitch.')
    }
  }

  async function handleReject(id) {
    try {
      await api.put(`/api/admin/pitches/${id}/reject`)
      setPitches(pitches.filter((p) => p.id !== id))
    } catch (err) {
      alert('Failed to reject pitch.')
    }
  }

  const filteredPitches = pitches.filter((p) => {
    const pitchStr = `${p.businessName || ''} ${p.ownerName || ''} ${p.description || ''} ${p.amountNeeded || ''}`.toLowerCase()
    return !searchQuery.trim() || pitchStr.includes(searchQuery.trim().toLowerCase())
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <BlurFade delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText size={16} className="text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pitch Review Queue</h2>
            </div>
            <p className="text-slate-500 text-sm">Review, evaluate, and approve incoming business pitches for the investment marketplace.</p>
          </div>
          <span className="badge badge-amber text-sm font-semibold self-start sm:self-auto">{filteredPitches.length} Pending</span>
        </div>
      </BlurFade>

      {/* Filter and Search Bar */}
      <BlurFade delay={0.03}>
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search business, owner, sector or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>
      </BlurFade>

      {/* SLA Delay Alert Banner */}
      {!loading && filteredPitches.length > 0 && (
        <BlurFade delay={0.05}>
          <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs">
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-rose-600 shrink-0" />
              <span className="font-medium">
                <strong className="font-semibold">{filteredPitches.length} business pitch{filteredPitches.length > 1 ? 'es' : ''}</strong> currently awaiting evaluation. Prompt reviews reduce deal friction.
              </span>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md shrink-0 hidden sm:inline-block">
              SLA Active
            </span>
          </div>
        </BlurFade>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-stone-100 animate-pulse rounded-2xl border border-stone-200/60" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredPitches.length === 0 && (
        <div className="text-center py-16 bg-stone-50/60 rounded-3xl border border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CheckCheck size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">All caught up!</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery ? `No pending pitches matched "${searchQuery}".` : 'No pending business pitches require review right now.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}

      {/* Asymmetric Pitch Cards */}
      {!loading && filteredPitches.length > 0 && (
        <div className="space-y-4">
          {filteredPitches.map((pitch, i) => (
            <BlurFade key={pitch.id} delay={0.1 + i * 0.05}>
              <div className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all grid grid-cols-1 md:grid-cols-12">
                {/* Left Details Panel */}
                <div className="md:col-span-8 p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{pitch.businessName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Submitted by <strong className="text-slate-600 font-semibold">{pitch.ownerName || 'Business Owner'}</strong></p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/70">
                      GH₵ {pitch.amountNeeded?.toLocaleString() || '50,000'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pitch.description || pitch.summary || 'Business pitch submitted for capital investment and MFI partnership.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
                    <div>Date Submitted: <span className="text-slate-900 font-semibold">{pitch.createdAt?.slice(0, 10) || 'Recent'}</span></div>
                    <div>Status: <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">{pitch.status || 'PENDING'}</span></div>
                  </div>
                </div>

                {/* Right Action Panel */}
                <div className="md:col-span-4 bg-stone-50/80 border-t md:border-t-0 md:border-l border-slate-200/60 p-6 flex flex-col justify-between space-y-4">
                  <div className="text-xs text-slate-500 space-y-1">
                    <span className="block font-semibold text-slate-700">Workflow Routing:</span>
                    <p className="leading-snug">Approving routes deal to MFI partner for legal review and investor bidding.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(pitch.id)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-emerald-500/20"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(pitch.id)}
                      className="bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 border border-slate-200 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  )
}

export default PitchReview