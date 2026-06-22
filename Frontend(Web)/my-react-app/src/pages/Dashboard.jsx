function Dashboard() {
  const stats = [
    { label: 'Total Users', value: '0' },
    { label: 'Active Deals', value: '0' },
    { label: 'Pending Pitches', value: '0' },
    { label: 'Total Revenue', value: 'GH₵ 0' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">Dashboard</h2>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className="text-amber-400 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-500 text-sm">No recent activity yet.</p>
      </div>
    </div>
  )
}

export default Dashboard