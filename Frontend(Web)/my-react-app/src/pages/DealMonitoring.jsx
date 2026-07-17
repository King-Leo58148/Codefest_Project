import { useState, useEffect } from 'react'
import api from '../api'

function DealMonitoring() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingActionId, setPendingActionId] = useState(null)

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      const response = await api.get('/api/admin/deals')
      const data = response.data
      setDeals(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load deals.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveMfi(dealId) {
    setPendingActionId(dealId)
    try {
      const response = await api.put(`/api/admin/deals/${dealId}/approve-mfi`)
      const updatedDeal = response.data
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)))
    } catch (err) {
      setError('Failed to approve deal.')
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleRejectMfi(dealId) {
    setPendingActionId(dealId)
    try {
      const response = await api.put(`/api/admin/deals/${dealId}/reject-mfi`)
      const updatedDeal = response.data
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)))
    } catch (err) {
      setError('Failed to reject deal.')
    } finally {
      setPendingActionId(null)
    }
  }

  const statusStyles = {
    PENDING_SIGNATURES: 'bg-gray-100 text-gray-500',
    PENDING_MFI: 'bg-amber-50 text-amber-600',
    MFI_APPROVED: 'bg-teal-50 text-teal-600',
    PAYMENT_PENDING: 'bg-blue-50 text-blue-600',
    ACTIVE: 'bg-green-50 text-green-600',
    COMPLETED: 'bg-purple-50 text-purple-600',
    CANCELLED: 'bg-red-50 text-red-500',
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Deal Monitoring</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track all active and historical deals on the platform.
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
          <p className="text-gray-400 text-sm">No deals found.</p>
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium px-6 py-4">Business</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Owner</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Investor</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const businessName = deal.pitch?.businessName || deal.bid?.pitch?.businessName || 'N/A'
                const ownerName = deal.owner?.fullName || deal.owner?.email || 'N/A'
                const investorName = deal.investor?.fullName || deal.investor?.email || deal.bid?.investor?.fullName || deal.bid?.investor?.email || 'N/A'
                const amount = deal.bid?.amount ?? deal.pitch?.amountNeeded ?? 'N/A'
                const isPending = pendingActionId === deal.id

                return (
                  <tr
                    key={deal.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="text-gray-900 font-medium px-6 py-4">{businessName}</td>
                    <td className="text-gray-500 px-6 py-4">{ownerName}</td>
                    <td className="text-gray-500 px-6 py-4">{investorName}</td>
                    <td className="text-gray-900 px-6 py-4">{typeof amount === 'number' ? `GH₵ ${amount}` : amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[deal.status] || 'bg-gray-100 text-gray-500'}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {deal.status === 'PENDING_MFI' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveMfi(deal.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isPending ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectMfi(deal.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isPending ? '...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DealMonitoring