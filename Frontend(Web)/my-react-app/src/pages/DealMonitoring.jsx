import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Briefcase, CheckCircle, Clock, Search } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'

function DealMonitoring() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('search') || ''

  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingActionId, setPendingActionId] = useState(null)
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      const response = await api.get('/api/admin/deals')
      const data = response.data
      setDeals(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load deals.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveMfi(dealId) {
    setPendingActionId(dealId)
    try {
      const response = await api.put(`/api/admin/deals/${dealId}/approve-mfi`)
      const updatedDeal = response.data
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)))
    } catch (err) {
      setError('Failed to approve deal.')
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleRejectMfi(dealId) {
    setPendingActionId(dealId)
    try {
      const response = await api.put(`/api/admin/deals/${dealId}/reject-mfi`)
      const updatedDeal = response.data
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)))
    } catch (err) {
      setError('Failed to reject deal.')
    } finally {
      setPendingActionId(null)
    }
  }

  const filteredDeals = deals.filter((deal) => {
    const businessName = (deal.pitch?.businessName || deal.bid?.pitch?.businessName || '').toLowerCase()
    const ownerName = (deal.owner?.fullName || deal.owner?.email || '').toLowerCase()
    const investorName = (deal.investor?.fullName || deal.investor?.email || deal.bid?.investor?.fullName || '').toLowerCase()
    const status = (deal.status || '').toLowerCase()
    const query = searchQuery.trim().toLowerCase()
    
    return !query || businessName.includes(query) || ownerName.includes(query) || investorName.includes(query) || status.includes(query)
  })

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'MFI_APPROVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
      case 'PENDING_MFI':
      case 'PENDING_SIGNATURES':
      case 'PAYMENT_PENDING':
        return 'bg-amber-50 text-amber-900 border-amber-200/80'
      case 'CANCELLED':
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  const totalCapital = filteredDeals.reduce((acc, d) => {
    const amt = typeof d.bid?.amount === 'number' ? d.bid.amount : typeof d.pitch?.amountNeeded === 'number' ? d.pitch.amountNeeded : 0
    return acc + amt
  }, 0)

  const pendingCount = filteredDeals.filter(d => d.status === 'PENDING_MFI').length

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Briefcase size={16} className="text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deal Monitoring & Oversight</h2>
            </div>
            <p className="text-slate-500 text-sm">Track lifecycle stages, capital commitments, and MFI legal approvals across all deals.</p>
          </div>
          <span className="badge badge-amber text-sm font-semibold">{filteredDeals.length} Deals Monitored</span>
        </div>
      </BlurFade>

      {/* Filter and Search Bar */}
      <BlurFade delay={0.03}>
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search business, owner, investor, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>
      </BlurFade>

      {/* Executive Summary Metrics */}
      {!loading && filteredDeals.length > 0 && (
        <BlurFade delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Monitored Volume</p>
              <p className="text-2xl font-bold text-slate-900">GH₵ {totalCapital.toLocaleString()}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Capital Collateralized
              </span>
            </div>

            <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending MFI Review</p>
              <p className="text-2xl font-bold text-slate-900">{pendingCount} Deals</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70">
                Action Required
              </span>
            </div>

            <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Disbursements</p>
              <p className="text-2xl font-bold text-slate-900">{filteredDeals.filter(d => d.status === 'ACTIVE').length} Live Deals</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                Healthy Portfolio
              </span>
            </div>
          </div>
        </BlurFade>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-stone-100 animate-pulse rounded-2xl border border-stone-200/60" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredDeals.length === 0 && (
        <div className="text-center py-16 bg-stone-50/60 rounded-3xl border border-dashed border-slate-200 p-8">
          <p className="text-slate-500 text-sm font-semibold">No investment deals matched "{searchQuery}".</p>
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

      {/* Deal Oversight Table */}
      {!loading && filteredDeals.length > 0 && (
        <BlurFade delay={0.1}>
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[780px] w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-stone-50/50">
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Business Entity</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Business Owner</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Investor</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Capital Commitment</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Lifecycle Status</th>
                    <th className="text-right text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Admin Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDeals.map((deal) => {
                    const businessName = deal.pitch?.businessName || deal.bid?.pitch?.businessName || 'Ghana Business Enterprise'
                    const ownerName = deal.owner?.fullName || deal.owner?.email || 'Business Owner'
                    const investorName = deal.investor?.fullName || deal.investor?.email || deal.bid?.investor?.fullName || deal.bid?.investor?.email || 'Institutional Investor'
                    const amount = deal.bid?.amount ?? deal.pitch?.amountNeeded ?? 50000
                    const isPending = pendingActionId === deal.id

                    return (
                      <tr key={deal.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{businessName}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{ownerName}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{investorName}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          GH₵ {typeof amount === 'number' ? amount.toLocaleString() : amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${getStatusBadgeStyle(deal.status)}`}>
                            {deal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deal.status === 'PENDING_MFI' ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => handleApproveMfi(deal.id)}
                                disabled={isPending}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                              >
                                {isPending ? '...' : 'Approve MFI'}
                              </button>
                              <button
                                onClick={() => handleRejectMfi(deal.id)}
                                disabled={isPending}
                                className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-50 transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">Synced</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </BlurFade>
      )}
    </div>
  )
}

export default DealMonitoring