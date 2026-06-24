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
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back. Here is what is happening today.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-gray-900 font-semibold mb-6">Recent Activity</h3>
        <div className="flex flex-col gap-4">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.color}`} />
              <div>
                <p className="text-gray-700 text-sm">{item.text}</p>
                <p className="text-gray-400 text-xs mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard