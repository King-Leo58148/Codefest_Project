import { useState, useEffect } from 'react'
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react'
import api from '../api'

function Dashboard() {
  const [users, setUsers] = useState([])
  const [pitches, setPitches] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, pitchesRes, dealsRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/pitches/pending'),
          api.get('/api/admin/deals/active'),
        ])
        setUsers(usersRes.data)
        setPitches(pitchesRes.data)
        setDeals(dealsRes.data)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = [
    {
      label: 'Total Users',
      value: loading ? '...' : users.length,
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-blue-500',
    },
    {
      label: 'Active Deals',
      value: loading ? '...' : deals.length,
      icon: Briefcase,
      bg: 'bg-green-50',
      color: 'text-green-500',
    },
    {
      label: 'Pending Pitches',
      value: loading ? '...' : pitches.length,
      icon: FileText,
      bg: 'bg-amber-50',
      color: 'text-amber-500',
    },
    {
      label: 'Total Revenue',
      value: 'GH₵ 0',
      icon: TrendingUp,
      bg: 'bg-purple-50',
      color: 'text-purple-500',
    },
  ]

  const activity = [
    {
      id: 1,
      text: 'Ama Owusu submitted a new pitch',
      time: '2 minutes ago',
      color: 'bg-amber-400',
    },
    {
      id: 2,
      text: 'Kofi Mensah placed a bid on Kofi Chop Bar',
      time: '15 minutes ago',
      color: 'bg-green-400',
    },
    {
      id: 3,
      text: 'Deal signed between Abena Boutique and Akosua Frimpong',
      time: '1 hour ago',
      color: 'bg-blue-400',
    },
    {
      id: 4,
      text: 'Kwame Farms missed a repayment',
      time: '3 hours ago',
      color: 'bg-red-400',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1.3fr]">
        <div className="glass-card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">Performance</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Platform overview</h2>
              <p className="mt-2 text-sm text-slate-500">Your current admin snapshot and top metrics for quick action.</p>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Updated just now</div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {stats.slice(0, 2).map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className={`${stat.bg} inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-4`}>
                    <Icon size={18} className={stat.color} />
                  </div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stats.slice(2).map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className={`${stat.bg} inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-4`}>
                    <Icon size={18} className={stat.color} />
                  </div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Reports</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Activity insights</h3>
            </div>
            <button className="pill-button">See all</button>
          </div>

          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-4">
                  <span className={`mt-1 inline-flex h-3.5 w-3.5 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.text}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="section-heading">Quick actions</h3>
            <p className="mt-2 text-sm text-slate-500">Jump into the most important admin workflows.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="pill-button">Review pitches</button>
            <button className="pill-button">Approve deals</button>
            <button className="pill-button">Track repayments</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard