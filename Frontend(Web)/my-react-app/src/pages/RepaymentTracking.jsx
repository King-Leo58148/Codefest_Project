import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CreditCard, TrendingUp, CheckCircle, AlertTriangle, Clock, RefreshCw, Calendar, Search } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'
import NumberTicker from '../components/magic/NumberTicker'
import AnalyticsChart from '../components/AnalyticsChart'

function RepaymentTracking() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('search') || ''

  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => { fetchDeals() }, [])

  async function fetchDeals() {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/deals')
      const all = Array.isArray(res.data) ? res.data : []
      setDeals(all.filter(d => ['ACTIVE', 'COMPLETED', 'PAYMENT_PENDING'].includes(d.status)))
    } catch {
      setError('Failed to load repayment data.')
    } finally {
      setLoading(false)
    }
  }

  function getRepaymentStatus(deal) {
    if (deal.status === 'COMPLETED') return 'completed'
    if (deal.status === 'ACTIVE') {
      const createdAt = deal.createdAt ? new Date(deal.createdAt) : new Date()
      const monthsElapsed = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const timeline = deal.timelineMonths || 6
      if (monthsElapsed > timeline) return 'overdue'
      return 'on-track'
    }
    return 'pending'
  }

  function getProgress(deal) {
    if (deal.status === 'COMPLETED') return 100
    const createdAt = deal.createdAt ? new Date(deal.createdAt) : new Date()
    const monthsElapsed = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const timeline = deal.timelineMonths || 6
    return Math.min(Math.round((monthsElapsed / timeline) * 100), 100)
  }

  const statusColors = {
    'completed': { text: 'text-emerald-800', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', label: 'Completed', icon: CheckCircle },
    'on-track': { text: 'text-indigo-800', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60', label: 'On Track', icon: TrendingUp },
    'overdue': { text: 'text-rose-900', bg: 'bg-rose-50 text-rose-900 border-rose-200/70', label: 'Overdue', icon: AlertTriangle },
    'pending': { text: 'text-amber-900', bg: 'bg-amber-50 text-amber-900 border-amber-200/70', label: 'Pending', icon: Clock },
  }

  const filteredDeals = deals.filter(d => {
    const matchesTab = filter === 'ALL' || getRepaymentStatus(d) === filter
    const businessName = (d.pitch?.businessName || d.bid?.pitch?.businessName || '').toLowerCase()
    const ownerName = (d.owner?.fullName || '').toLowerCase()
    const investorName = (d.investor?.fullName || d.bid?.investor?.fullName || '').toLowerCase()
    const ref = (d.paystackRef || '').toLowerCase()
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || businessName.includes(query) || ownerName.includes(query) || investorName.includes(query) || ref.includes(query)

    return matchesTab && matchesSearch
  })

  const summary = {
    total: filteredDeals.length,
    onTrack: filteredDeals.filter(d => getRepaymentStatus(d) === 'on-track').length,
    overdue: filteredDeals.filter(d => getRepaymentStatus(d) === 'overdue').length,
    completed: filteredDeals.filter(d => getRepaymentStatus(d) === 'completed').length,
    totalValue: filteredDeals.reduce((sum, d) => sum + (d.bid?.amount ?? d.pitch?.amountNeeded ?? 0), 0),
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CreditCard size={16} className="text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Repayment Schedule Tracking</h2>
            </div>
            <p className="text-slate-500 text-sm">Monitor principal return schedules and interest yield compliance across active investments.</p>
          </div>
          <button
            onClick={fetchDeals}
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </BlurFade>

      {/* Summary Cards */}
      <BlurFade delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Monitored Deals', value: summary.total, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'On Track', value: summary.onTrack, color: 'text-indigo-800', bg: 'bg-indigo-50/60 border-indigo-200/60' },
            { label: 'Overdue Schedules', value: summary.overdue, color: 'text-rose-900', bg: 'bg-rose-50/60 border-rose-200/70' },
            { label: 'Fully Repaid', value: summary.completed, color: 'text-emerald-800', bg: 'bg-emerald-50/60 border-emerald-200/60' },
            { label: 'Capital Outstanding', value: null, display: `GH₵ ${(summary.totalValue / 1000).toFixed(0)}K`, color: 'text-slate-900', bg: 'bg-white' },
          ].map((s) => (
            <div key={s.label} className={`border border-slate-200/70 rounded-2xl p-4 text-center shadow-xs ${s.bg}`}>
              <p className="text-xs font-semibold text-slate-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>
                {s.value !== null ? <NumberTicker value={s.value} className={s.color} /> : s.display}
              </p>
            </div>
          ))}
        </div>
      </BlurFade>

      {/* Interactive Repayment Analytics Chart */}
      <BlurFade delay={0.08}>
        <AnalyticsChart
          title="Repayment Yield Collection Velocity"
          subtitle="Real-time repayment return performance calculated from active backend deals"
          deals={deals}
          color="#10b981"
        />
      </BlurFade>

      {/* Filter Tabs & Content */}
      <BlurFade delay={0.1}>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          {/* Segmented Filter Control & Search Bar */}
          <div className="p-3 bg-stone-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="inline-flex bg-stone-200/60 p-1 rounded-xl gap-1 w-full sm:w-auto overflow-x-auto">
              {[
                { key: 'ALL', label: 'All Deals' },
                { key: 'on-track', label: 'On Track' },
                { key: 'overdue', label: 'Overdue' },
                { key: 'completed', label: 'Completed' },
                { key: 'pending', label: 'Pending' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filter === tab.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter repayments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-24 bg-stone-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-semibold">
                {searchQuery ? `No repayments matched "${searchQuery}".` : 'No repayment schedules found in this category.'}
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
                const repayStatus = getRepaymentStatus(deal)
                const progress = getProgress(deal)
                const status = statusColors[repayStatus]
                const StatusIcon = status.icon
                const returnValue = deal.returnValue || 12
                const timeline = deal.timelineMonths || 6

                const isOverdue = repayStatus === 'overdue'

                return (
                  <div
                    key={deal.id}
                    className={`p-5 transition-colors ${
                      isOverdue ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : 'hover:bg-stone-50/70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-900 text-sm">{businessName}</p>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${status.bg}`}>
                            <StatusIcon size={12} /> {status.label}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-3">
                          Owner: <strong className="text-slate-700">{ownerName}</strong> · Investor: <strong className="text-slate-700">{investorName}</strong>
                        </p>

                        {/* Amount & Yield Metrics */}
                        <div className="flex flex-wrap gap-6 mb-3 text-xs">
                          <div>
                            <p className="text-slate-400 font-medium">Principal Capital</p>
                            <p className="text-sm font-bold text-slate-900">GH₵ {amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium">Yield Return</p>
                            <p className="text-sm font-bold text-emerald-700">{returnValue}% Return</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium">Term</p>
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                              <Calendar size={12} className="text-slate-500" /> {timeline} months
                            </p>
                          </div>
                        </div>

                        {/* Dual Stacked Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-slate-600">Repayment Progress</span>
                            <span className={isOverdue ? 'text-rose-700 font-bold' : 'text-slate-900'}>{progress}%</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden flex">
                            {/* Principal Segment */}
                            <div
                              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 70)}%` }}
                            />
                            {/* Interest Segment */}
                            {progress > 70 && (
                              <div
                                className="bg-indigo-500 h-full rounded-r-full transition-all duration-500"
                                style={{ width: `${progress - 70}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status Ref */}
                      {deal.paystackRef && (
                        <div className="shrink-0 bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-900 max-w-[200px]">
                          <p className="font-bold mb-0.5">Paystack Confirmed</p>
                          <p className="text-emerald-700 text-[11px] truncate">Ref: {deal.paystackRef}</p>
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

export default RepaymentTracking
