function DealMonitoring() {
  const deals = [
    {
      id: 1,
      business: 'Ama Fashion',
      investor: 'Kofi Mensah',
      amount: 'GH₵ 5,000',
      status: 'Active',
    },
    {
      id: 2,
      business: 'Kofi Chop Bar',
      investor: 'Yaw Darko',
      amount: 'GH₵ 2,000',
      status: 'Pending',
    },
    {
      id: 3,
      business: 'Abena Boutique',
      investor: 'Akosua Frimpong',
      amount: 'GH₵ 8,000',
      status: 'Completed',
    },
    {
      id: 4,
      business: 'Kwame Farms',
      investor: 'Esi Boateng',
      amount: 'GH₵ 3,500',
      status: 'Defaulted',
    },
  ]

  const statusColors = {
    Active: 'bg-green-500/10 text-green-400',
    Pending: 'bg-amber-400/10 text-amber-400',
    Completed: 'bg-blue-500/10 text-blue-400',
    Defaulted: 'bg-red-500/10 text-red-400',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">Deal Monitoring</h2>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 px-6 py-4">Business</th>
              <th className="text-left text-gray-400 px-6 py-4">Investor</th>
              <th className="text-left text-gray-400 px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-b border-gray-800">
                <td className="text-white px-6 py-4">{deal.business}</td>
                <td className="text-gray-400 px-6 py-4">{deal.investor}</td>
                <td className="text-white px-6 py-4">{deal.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColors[deal.status]}`}>
                    {deal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DealMonitoring