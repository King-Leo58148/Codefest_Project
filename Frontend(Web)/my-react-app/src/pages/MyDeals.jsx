import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function MyDeals() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await api.get('/api/deals/my-deals')
        setDeals(response.data)
      } catch (err) {
        setError('Failed to load your deals.')
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My Deals</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track active investments and funding agreements.
          </p>
        </div>
      </div>

      {loading && (
        <div className="p-10 flex flex-col items-center justify-center">
          <p className="text-slate-500 text-sm font-medium">Loading your deals...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && deals.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No active deals</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            You don't have any active deals yet. Once a bid is accepted, it will appear here.
          </p>
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Business</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Partner</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Created</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((deal) => {
                  const businessName = deal.pitch?.businessName || deal.bid?.pitch?.businessName || 'N/A'
                  const partnerName = deal.investor?.fullName || deal.owner?.fullName || 'N/A'
                  const amount = deal.bid?.amount ?? deal.pitch?.amountNeeded ?? 0
                  
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{businessName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">ID: #{deal.id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {partnerName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">GH₵ {amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/deal/${deal.id}`)}
                          className="text-slate-600 hover:text-slate-900 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-slate-50"
                        >
                          View Room
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyDeals
