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
      <h2 className="text-2xl font-bold text-white mb-8">MFI Workflow</h2>
      <p className="text-gray-400 text-sm mb-6">
        Signed deals waiting for MFI approval. Click Trigger Approval to send
        the deal to the MFI partner.
      </p>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 px-6 py-4">Business</th>
              <th className="text-left text-gray-400 px-6 py-4">Owner</th>
              <th className="text-left text-gray-400 px-6 py-4">Investor</th>
              <th className="text-left text-gray-400 px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 px-6 py-4">Signed</th>
              <th className="text-left text-gray-400 px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-b border-gray-800">
                <td className="text-white px-6 py-4">{deal.business}</td>
                <td className="text-gray-400 px-6 py-4">{deal.owner}</td>
                <td className="text-gray-400 px-6 py-4">{deal.investor}</td>
                <td className="text-white px-6 py-4">{deal.amount}</td>
                <td className="text-gray-400 px-6 py-4">{deal.signed}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTrigger(deal.id)}
                    className="bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-lg text-xs hover:bg-amber-400/20"
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