import { useState, useEffect } from 'react'
import api from '../api'

function PitchReview() {
  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPitches() {
      try {
        const response = await api.get('/api/admin/pitches/pending')
        const data = response.data
        setPitches(Array.isArray(data) ? data : [])
      } catch (err) {
        setError('Failed to load pitches.')
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [])

  async function handleApprove(id) {
    try {
      await api.put(`/api/admin/pitches/${id}/approve`)
      setPitches(pitches.filter((p) => p.id !== id))
    } catch (err) {
      alert('Failed to approve pitch.')
    }
  }

  async function handleReject(id) {
    try {
      await api.put(`/api/admin/pitches/${id}/reject`)
      setPitches(pitches.filter((p) => p.id !== id))
    } catch (err) {
      alert('Failed to reject pitch.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Pitch Review</h2>
        <p className="text-gray-400 text-sm mt-1">
          Review and approve incoming business pitches.
        </p>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading pitches...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && pitches.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">No pending pitches at the moment.</p>
        </div>
      )}

      {!loading && pitches.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-sm">
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
                  <td className="text-gray-900 font-medium px-6 py-4">{pitch.businessName}</td>
                  <td className="text-gray-500 px-6 py-4">{pitch.ownerName}</td>
                  <td className="text-gray-900 px-6 py-4">GH₵ {pitch.amountNeeded}</td>
                  <td className="text-gray-500 px-6 py-4">{pitch.createdAt?.slice(0, 10)}</td>
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
      )}
    </div>
  )
}

export default PitchReview