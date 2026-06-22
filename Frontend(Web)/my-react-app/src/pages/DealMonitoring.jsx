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

  const statusStyles = {
    Active: 'bg-green-50 text-green-600',
    Pending: 'bg-amber-50 text-amber-600',
    Completed: 'bg-blue-50 text-blue-600',
    Defaulted: 'bg-red-50 text-red-500',
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Deal Monitoring</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track all active and historical deals on the platform.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium px-6 py-4">Business</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Investor</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr
                key={deal.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="text-gray-900 font-medium px-6 py-4">{deal.business}</td>
                <td className="text-gray-500 px-6 py-4">{deal.investor}</td>
                <td className="text-gray-900 px-6 py-4">{deal.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[deal.status]}`}>
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