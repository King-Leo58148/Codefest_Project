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
  ]

  function handleApprove(id) {
    alert(`Pitch ${id} approved`)
  }

  function handleReject(id) {
    alert(`Pitch ${id} rejected`)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">Pitch Review</h2>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 px-6 py-4">Business</th>
              <th className="text-left text-gray-400 px-6 py-4">Owner</th>
              <th className="text-left text-gray-400 px-6 py-4">Amount</th>
              <th className="text-left text-gray-400 px-6 py-4">Date</th>
              <th className="text-left text-gray-400 px-6 py-4">Status</th>
              <th className="text-left text-gray-400 px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pitches.map((pitch) => (
              <tr key={pitch.id} className="border-b border-gray-800">
                <td className="text-white px-6 py-4">{pitch.business}</td>
                <td className="text-gray-400 px-6 py-4">{pitch.owner}</td>
                <td className="text-white px-6 py-4">{pitch.amount}</td>
                <td className="text-gray-400 px-6 py-4">{pitch.date}</td>
                <td className="px-6 py-4">
                  <span className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-xs">
                    {pitch.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(pitch.id)}
                    className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-lg text-xs hover:bg-green-500/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(pitch.id)}
                    className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs hover:bg-red-500/20"
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