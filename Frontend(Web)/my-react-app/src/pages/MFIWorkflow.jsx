function MFIWorkflow() {
  const deals = [
    {
      id: 1,
      business: 'Ama Fashion',
      owner: 'Ama Owusu',
      investor: 'Kofi Mensah',
      amount: 'GH₵ 5,000',
      signed: '2026-06-20',
    },
    {
      id: 2,
      business: 'Kwame Farms',
      owner: 'Kwame Asante',
      investor: 'Esi Boateng',
      amount: 'GH₵ 3,500',
      signed: '2026-06-21',
    },
  ]

  function handleTrigger(id) {
    alert(`MFI approval triggered for deal ${id}`)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">MFI Workflow</h2>
        <p className="text-gray-400 text-sm mt-1">
          Signed deals waiting for MFI approval. Trigger approval to make
          deals legally enforceable.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium px-6 py-4">Business</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Owner</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Investor</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Signed</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr
                key={deal.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="text-gray-900 font-medium px-6 py-4">{deal.business}</td>
                <td className="text-gray-500 px-6 py-4">{deal.owner}</td>
                <td className="text-gray-500 px-6 py-4">{deal.investor}</td>
                <td className="text-gray-900 px-6 py-4">{deal.amount}</td>
                <td className="text-gray-500 px-6 py-4">{deal.signed}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTrigger(deal.id)}
                    className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                  >
                    Trigger Approval
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MFIWorkflow