function RepaymentTracking() {
  const repayments = [
    {
      id: 1,
      deal: 'Ama Fashion',
      investor: 'Kofi Mensah',
      amount: 'GH₵ 500',
      dueDate: '2026-06-15',
      status: 'Paid',
    },
    {
      id: 2,
      deal: 'Kwame Farms',
      investor: 'Esi Boateng',
      amount: 'GH₵ 350',
      dueDate: '2026-06-15',
      status: 'Missed',
    },
    {
      id: 3,
      deal: 'Abena Boutique',
      investor: 'Akosua Frimpong',
      amount: 'GH₵ 800',
      dueDate: '2026-06-22',
      status: 'Pending',
    },
  ]

  const statusColors = {
    Paid: 'bg-green-500/10 text-green-400',
    Missed: 'bg-red-500/10 text-red-400',
    Pending: 'bg-amber-400/10 text-amber-400',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">
        Repayment Tracking
      </h2>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 px-6 py-4">Deal</th>
              <th className="text-left text-gray-400 px-6 py-4">Investor</th>
              <th className="text-left text-gray-400 px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 px-6 py-4">Due Date</th>
              <th className="text-left text-gray-400 px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((repayment) => (
              <tr key={repayment.id} className="border-b border-gray-800">
                <td className="text-white px-6 py-4">{repayment.deal}</td>
                <td className="text-gray-400 px-6 py-4">
                  {repayment.investor}
                </td>
                <td className="text-white px-6 py-4">{repayment.amount}</td>
                <td className="text-gray-400 px-6 py-4">{repayment.dueDate}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${statusColors[repayment.status]}`}
                  >
                    {repayment.status}
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

export default RepaymentTracking