import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Building2, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, Search } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'
import NumberTicker from '../components/magic/NumberTicker'

const WORKFLOW_STEPS = [
  { id: 1, label: 'Signatures Collected', desc: 'Both parties sign agreement' },
  { id: 2, label: 'Submitted for MFI Review', desc: 'MFI legal partner review' },
  { id: 3, label: 'MFI Decision', desc: 'Approval or rejection' },
  { id: 4, label: 'Payment Initiated', desc: 'Investor releases funds' },
  { id: 5, label: 'Funds Disbursed', desc: 'Capital delivered to business' },
]

const statusToStep = {
  PENDING_SIGNATURES: 1,
  PENDING_MFI: 2,
  MFI_APPROVED: 3,
  PAYMENT_PENDING: 4,
  ACTIVE: 5,
  COMPLETED: 5,
}

function getStepForDeal(deal) {
  return statusToStep[deal.status] || 1
}

function MFIWorkflow() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('search') || ''

  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState(null)
  const [activeTab, setActiveTab] = useState('PENDING_MFI')
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => { fetchDeals() }, [])

  async function fetchDeals() {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/deals')
      setDeals(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load MFI workflow data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id) {
    setPendingId(id)
    try {
      const res = await api.put(`/api/admin/deals/${id}/approve-mfi`)
      setDeals(prev => prev.map(d => d.id === id ? res.data : d))
    } catch { setError('Failed to approve deal.') }
    finally { setPendingId(null) }
  }

  async function handleReject(id) {
    setPendingId(id)
    try {
      const res = await api.put(`/api/admin/deals/${id}/reject-mfi`)
      setDeals(prev => prev.map(d => d.id === id ? res.data : d))
    } catch { setError('Failed to reject deal.') }
    finally { setPendingId(null) }
  }

  const tabs = [
    { key: 'PENDING_MFI', label: 'Awaiting Review', icon: Clock },
    { key: 'MFI_APPROVED', label: 'Approved', icon: CheckCircle },
    { key: 'CANCELLED', label: 'Rejected', icon: XCircle },
    { key: 'ALL', label: 'All Deals', icon: Building2 },
  ]

  const filteredDeals = deals.filter(d => {
    const matchesTab = activeTab === 'ALL' || d.status === activeTab
    const businessName = (d.pitch?.businessName || d.bid?.pitch?.businessName || '').toLowerCase()
    const ownerName = (d.owner?.fullName || '').toLowerCase()
    const investorName = (d.investor?.fullName || d.bid?.investor?.fullName || '').toLowerCase()
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || businessName.includes(query) || ownerName.includes(query) || investorName.includes(query)
    
    return matchesTab && matchesSearch
  })

  const pendingCount = deals.filter(d => d.status === 'PENDING_MFI').length

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building2 size={16} className="text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">MFI Approval Workflow</h2>
            </div>
            <p className="text-slate-500 text-sm">Manage legal partner review, compliance verification, and capital signoffs.</p>
          </div>
          <button
            onClick={fetchDeals}
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Queue
          </button>
        </div>
      </BlurFade>

      {/* Goal Gradient Stepper */}
      <BlurFade delay={0.05}>
        <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">Standard MFI Approval Pipeline</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i === 1
                      ? 'bg-emerald-500 text-white font-bold scale-110 ring-4 ring-emerald-100 shadow-sm'
                      : i < 1
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {i < 1 ? '✓' : step.id}
                </div>
                <p className="text-xs font-semibold text-slate-900 mt-2 px-1">{step.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 px-1 hidden sm:block leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Segmented Filter Control & Workflow Deals */}
      <BlurFade delay={0.15}>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          {/* Segmented Tab Bar & Search Input */}
          <div className="p-3 bg-stone-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="inline-flex bg-stone-200/60 p-1 rounded-xl gap-1 w-full sm:w-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-1 sm:flex-none ${
                      isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {tab.key === 'PENDING_MFI' && pendingCount > 0 && (
                      <span className="ml-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter workflow..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-stone-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-semibold">
                {searchQuery ? `No MFI workflow deals matched "${searchQuery}".` : 'No deals matched the selected workflow tab.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDeals.map((deal, i) => {
                const businessName = deal.pitch?.businessName || deal.bid?.pitch?.businessName || 'Enterprise Deal'
                const ownerName = deal.owner?.fullName || 'Business Owner'
                const investorName = deal.investor?.fullName || deal.bid?.investor?.fullName || 'Accredited Investor'
                const amount = deal.bid?.amount ?? deal.pitch?.amountNeeded ?? 50000
                const step = getStepForDeal(deal)
                const isPending = pendingId === deal.id

                return (
                  <div key={deal.id} className="p-5 hover:bg-stone-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate">{businessName}</p>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/70">
                            {deal.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Owner: <strong className="text-slate-700">{ownerName}</strong> · Investor: <strong className="text-slate-700">{investorName}</strong> · Capital: <strong className="text-slate-900">GH₵ {typeof amount === 'number' ? amount.toLocaleString() : amount}</strong>
                        </p>
                        
                        {/* Inline Stepper Bar */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {WORKFLOW_STEPS.map((s) => (
                            <div key={s.id} className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${step >= s.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                              {s.id < WORKFLOW_STEPS.length && <div className={`w-3.5 h-0.5 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                            </div>
                          ))}
                          <span className="text-[10px] font-semibold text-slate-500 ml-1">Step {step}/5</span>
                        </div>

                        {/* Bottleneck indicator for pending MFI */}
                        {deal.status === 'PENDING_MFI' && (
                          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] px-2.5 py-1 rounded-md font-medium mt-1">
                            <Clock size={12} className="text-amber-700" />
                            <span>Awaiting legal signoff from MFI compliance officer</span>
                          </div>
                        )}
                      </div>

                      {deal.status === 'PENDING_MFI' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(deal.id)}
                            disabled={isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                          >
                            {isPending ? '...' : 'Approve MFI'}
                          </button>
                          <button
                            onClick={() => handleReject(deal.id)}
                            disabled={isPending}
                            className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 py-2 px-3.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  )
}

export default MFIWorkflow
