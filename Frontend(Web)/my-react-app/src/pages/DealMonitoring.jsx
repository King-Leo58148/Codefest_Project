import { useState, useEffect } from 'react'
import api from '../api'

function DealMonitoring() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await api.get('/api/admin/deals')
        setDeals(response.data)
      } catch (err) {
        setError('Failed to load deals.')
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  const statusStyles = {
    PENDING_SIGNATURES: 'bg-gray-100 text-gray-500',
    PENDING_MFI: 'bg-amber-50 text-amber-600',
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium px-6 py-4">Business</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Owner</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Investor</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const businessName = deal.pitch?.businessName || deal.bid?.pitch?.businessName || 'N/A'
                const ownerName = deal.owner?.fullName || deal.owner?.email || 'N/A'
                const investorName = deal.investor?.fullName || deal.investor?.email || deal.bid?.investor?.fullName || deal.bid?.investor?.email || 'N/A'
                const amount = deal.bid?.amount ?? deal.pitch?.amountNeeded ?? 'N/A'

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