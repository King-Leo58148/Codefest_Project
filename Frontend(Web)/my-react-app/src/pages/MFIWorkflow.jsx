import { useState, useEffect } from 'react'
import api from '../api'

function MFIWorkflow() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await api.get('/api/admin/deals/pending-mfi')
        setDeals(response.data)
      } catch (err) {
        setError('Failed to load pending MFI deals.')
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  async function handleTrigger(id) {
    try {
      await api.put(`/api/admin/deals/${id}/approve-mfi`)
      setDeals(deals.filter((d) => d.id !== id))
    } catch (err) {
      alert('Failed to trigger MFI approval.')
    }
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

      {loading && (
        <p className="text-gray-400 text-sm">Loading deals...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && deals.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">No deals pending MFI approval.</p>
        </div>
      )}

      {!loading && deals.length > 0 && (
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
                  <td className="text-gray-900 font-medium px-6 py-4">{deal.businessName}</td>
                  <td className="text-gray-500 px-6 py-4">{deal.ownerName}</td>
                  <td className="text-gray-500 px-6 py-4">{deal.investorName}</td>
                  <td className="text-gray-900 px-6 py-4">GH₵ {deal.amount}</td>
                  <td className="text-gray-500 px-6 py-4">{deal.signedAt?.slice(0, 10)}</td>
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
      )}
    </div>
  )
}

export default MFIWorkflow