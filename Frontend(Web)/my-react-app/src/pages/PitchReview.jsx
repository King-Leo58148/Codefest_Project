function PitchReview() {
  const pitches = [
    {
      id: 1,
      business: 'Ama Fashion',
      owner: 'Ama Owusu',
      amount: 'GH₵ 5,000',
      date: '2026-06-20',
      status: 'Pending',
    },
    {
      id: 2,
      business: 'Kofi Chop Bar',
      owner: 'Kofi Mensah',
      amount: 'GH₵ 2,000',
      date: '2026-06-21',
      status: 'Pending',
    },
    {
      id: 3,
      business: 'Abena Boutique',
      owner: 'Abena Asante',
      amount: 'GH₵ 8,000',
      date: '2026-06-22',
      status: 'Pending',
    },
  ]

  function handleApprove(id) {
    alert(`Pitch ${id} approved`)
  }

  function handleReject(id) {
    alert(`Pitch ${id} rejected`)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Pitch Review</h2>
        <p className="text-gray-400 text-sm mt-1">
          Review and approve incoming business pitches.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium px-6 py-4">Business</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Owner</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Date</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pitches.map((pitch) => (
              <tr key={pitch.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="text-gray-900 font-medium px-6 py-4">{pitch.business}</td>
                <td className="text-gray-500 px-6 py-4">{pitch.owner}</td>
                <td className="text-gray-900 px-6 py-4">{pitch.amount}</td>
                <td className="text-gray-500 px-6 py-4">{pitch.date}</td>
                <td className="px-6 py-4">
                  <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-medium">
                    {pitch.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(pitch.id)}
                    className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(pitch.id)}
                    className="bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    Reject
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

export default PitchReview