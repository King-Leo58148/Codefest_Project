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
    {
      id: 4,
      deal: 'Kofi Chop Bar',
      investor: 'Yaw Darko',
      amount: 'GH₵ 200',
      dueDate: '2026-06-28',
      status: 'Pending',
    },
  ]

  const statusStyles = {
    Paid: 'bg-green-50 text-green-600',
    Missed: 'bg-red-50 text-red-500',
    Pending: 'bg-amber-50 text-amber-600',
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Repayment Tracking</h2>
        <p className="text-gray-400 text-sm mt-1">
          Monitor repayment schedules and flag missed payments.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium px-6 py-4">Deal</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Investor</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Due Date</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((repayment) => (
              <tr
                key={repayment.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="text-gray-900 font-medium px-6 py-4">{repayment.deal}</td>
                <td className="text-gray-500 px-6 py-4">{repayment.investor}</td>
                <td className="text-gray-900 px-6 py-4">{repayment.amount}</td>
                <td className="text-gray-500 px-6 py-4">{repayment.dueDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[repayment.status]}`}>
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