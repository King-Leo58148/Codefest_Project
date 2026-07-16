import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function MyBids() {
  const navigate = useNavigate()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchBids() {
      try {
        const response = await api.get('/api/bids/my-bids')
        setBids(response.data)
      } catch (err) {
        setError('Failed to load your bids.')
      } finally {
        setLoading(false)
      }
    }
    fetchBids()
  }, [])

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My Bids</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track the status of your investment offers.
          </p>
        </div>
        <button onClick={() => navigate('/explore')} className="cta-button shrink-0 py-2">
          Find Deals
        </button>
      </div>

      {loading && (
        <div className="p-10 flex flex-col items-center justify-center">
          <p className="text-slate-500 text-sm font-medium">Loading your bids...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && bids.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bids placed</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            You haven't made any investment offers yet.
          </p>
          <button onClick={() => navigate('/explore')} className="cta-button">
            Explore Pitches
          </button>
        </div>
      )}

      {!loading && bids.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Business</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Pitch Amount</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Your Bid</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Date Placed</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{bid.pitch?.businessName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      GH₵ {bid.pitch?.amountNeeded?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">GH₵ {bid.amount?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/pitch/${bid.pitch?.id}`)}
                        className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                      >
                        View Pitch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBids
