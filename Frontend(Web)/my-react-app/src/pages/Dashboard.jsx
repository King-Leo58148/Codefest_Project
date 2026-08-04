import { useState, useEffect } from 'react'
import { Users, Briefcase, FileText, TrendingUp, ArrowUpRight, Activity, ChevronRight, ShieldCheck, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'
import NumberTicker from '../components/magic/NumberTicker'
import AnalyticsChart from '../components/AnalyticsChart'

function Dashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [pitches, setPitches] = useState([])
  const [deals, setDeals] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')

  useEffect(() => {
    const r = localStorage.getItem('userRole') || 'ADMIN'
    setRole(r)
    fetchData(r)
  }, [])

  async function fetchData(r) {
    try {
      if (r === 'ADMIN') {
        const [usersRes, pitchesRes, dealsRes, notificationsRes] = await Promise.all([
          api.get('/api/admin/users').catch(() => ({ data: [] })),
          api.get('/api/admin/pitches/pending').catch(() => ({ data: [] })),
          api.get('/api/admin/deals/active').catch(() => ({ data: [] })),
          api.get('/api/notifications').catch(() => ({ data: [] }))
        ])
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : [])
        setPitches(Array.isArray(pitchesRes.data) ? pitchesRes.data : [])
        setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : [])
        setActivity(Array.isArray(notificationsRes.data) ? notificationsRes.data.slice(0, 6) : [])
      } else {
        const notificationsRes = await api.get('/api/notifications').catch(() => ({ data: [] }))
        setActivity(Array.isArray(notificationsRes.data) ? notificationsRes.data.slice(0, 6) : [])
      }
    } catch (err) {
      console.error('Dashboard fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = role === 'ADMIN'
    ? [
        { label: 'Review Pending Pitches', path: '/pitches', count: pitches.length, badgeBg: 'bg-emerald-100 text-emerald-900' },
        { label: 'Monitor Active Deals', path: '/deals', count: deals.length, badgeBg: 'bg-emerald-100 text-emerald-900' },
        { label: 'MFI Approval Workflow', path: '/mfi', count: deals.filter(d => d.status === 'PENDING_MFI').length, badgeBg: 'bg-indigo-100 text-indigo-900' },
        { label: 'Repayment Tracking', path: '/repayments', count: null, badgeBg: '' },
        { label: 'Manage Platform Users', path: '/users', count: users.length, badgeBg: 'bg-slate-200 text-slate-800' },
      ]
    : role === 'BUSINESS_OWNER'
    ? [
        { label: 'Create New Pitch', path: '/create-pitch', count: null, badgeBg: '' },
        { label: 'My Submitted Pitches', path: '/my-pitches', count: pitches.length, badgeBg: 'bg-emerald-100 text-emerald-900' },
        { label: 'My Active Deals', path: '/my-deals', count: deals.length, badgeBg: 'bg-indigo-100 text-indigo-900' },
      ]
    : [
        { label: 'Explore Pitches', path: '/explore', count: null, badgeBg: '' },
        { label: 'My Active Bids', path: '/my-bids', count: null, badgeBg: '' },
        { label: 'Investment Portfolio', path: '/my-deals', count: deals.length, badgeBg: 'bg-indigo-100 text-indigo-900' },
      ]

  return (
    <div className="space-y-6 pb-8">
      {/* Asymmetric Hero Banner */}
      <BlurFade delay={0}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Overview Panel */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-slate-900 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 mb-3">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Ghana Fintech Operations</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nkoso Executive Control Panel</h1>
              <p className="text-slate-600 text-sm mt-1.5 max-w-xl leading-relaxed">
                {role === 'ADMIN'
                  ? 'Monitor active investment flows, evaluate pending business pitches, and oversee MFI legal signoffs across Ghanaian microfinance institutions.'
                  : role === 'BUSINESS_OWNER'
                  ? 'Track your pitch submissions, monitor deal approvals, and manage capital disbursements.'
                  : 'Discover vetted business opportunities and track your active marketplace investments.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-slate-200 text-xs font-medium text-slate-600">
              <div>Total Deployed: <span className="font-bold text-emerald-700 text-sm">GHS 4.25M</span></div>
              <div>Active Deals: <span className="font-bold text-slate-900 text-sm">{deals.length}</span></div>
              <div>Registered Users: <span className="font-bold text-slate-900 text-sm">{users.length}</span></div>
            </div>
          </div>

          {/* Right Executive Focal Card */}
          <div className="lg:col-span-4 bg-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Action Required</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {pitches.length} Pitches
              </div>
              <p className="text-slate-400 text-xs mt-1.5 leading-normal">
                Pending business pitches require admin approval before being listed on the investor marketplace.
              </p>
            </div>
            <button
              onClick={() => navigate('/pitches')}
              className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Review Pending Pitches
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Interactive Analytics SVG Chart Graph */}
      <BlurFade delay={0.05}>
        <AnalyticsChart
          title="Ghana Investment Capital Flow"
          subtitle="Real-time capital deployment calculated from active backend deals"
          deals={deals}
          pitches={pitches}
          color="#10b981"
        />
      </BlurFade>

      {/* Asymmetric Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Hero Stat Card (Pending Pitches) */}
        <BlurFade delay={0.08} className="sm:col-span-2 lg:col-span-2">
          <div className="bg-white border-l-4 border-l-emerald-500 rounded-2xl p-5 border border-slate-200/70 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">High Priority</p>
                <h3 className="text-sm font-medium text-slate-600">Pending Pitch Queue</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse" /> : <NumberTicker value={pitches.length} className="text-slate-900" />}
              </span>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                Review required
              </span>
            </div>
          </div>
        </BlurFade>

        {/* Regular Stat Cards */}
        {[
          { label: 'Total Platform Users', value: users.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Deals', value: deals.length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Account Ratio', value: users.filter(u => u.status === 'ACTIVE').length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <BlurFade key={stat.label} delay={0.12 + i * 0.05}>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-sm transition-all h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {loading ? (
                    <span className="inline-block w-10 h-7 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <NumberTicker value={stat.value} className="text-slate-900" />
                  )}
                </p>
              </div>
            </BlurFade>
          )
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Activity Feed */}
        <BlurFade delay={0.2} className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs h-full">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Audit Log</p>
                <h3 className="text-base font-bold text-slate-900">Recent Platform Activity</h3>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 transition-colors cursor-pointer"
              >
                View Feed <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {loading && (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 mt-2 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                ))
              )}
              {!loading && activity.length === 0 && (
                <div className="text-center py-10">
                  <Activity size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No recent activity logged in system feed.</p>
                </div>
              )}
              {!loading && activity.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default"
                >
                  <span className="w-2 h-2 rounded-full mt-2 shrink-0 bg-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{item.message || item.text || item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </BlurFade>

        {/* Quick Task Shortcuts */}
        <BlurFade delay={0.25} className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Prioritized Work</p>
                <h3 className="text-base font-bold text-slate-900">Admin Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-950">{action.label}</span>
                    <div className="flex items-center gap-2">
                      {action.count !== null && action.count !== undefined && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${action.badgeBg}`}>
                          {action.count}
                        </span>
                      )}
                      <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Activation Health Footer */}
            {role === 'ADMIN' && !loading && (
              <div className="m-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-700" />
                    Active User Ratio
                  </span>
                  <span>{users.length > 0 ? Math.round((users.filter(u => u.status === 'ACTIVE').length / users.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${users.length > 0 ? Math.round((users.filter(u => u.status === 'ACTIVE').length / users.length) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </BlurFade>
      </div>
    </div>
  )
}

export default Dashboard