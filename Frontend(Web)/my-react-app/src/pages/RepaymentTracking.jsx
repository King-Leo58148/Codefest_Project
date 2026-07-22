import { useState, useEffect } from 'react'
import api from '../api'

function RepaymentTracking() {
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL or MISSED

  useEffect(() => {
    fetchRepayments(filter)
  }, [filter])

  async function fetchRepayments(currentFilter) {
    setLoading(true)
    setError('')
    try {
      const endpoint = currentFilter === 'MISSED' 
        ? '/api/admin/repayments/missed' 
        : '/api/admin/repayments'
      const response = await api.get(endpoint)
      const data = response.data
      setRepayments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load repayments.')
    } finally {
      setLoading(false)
    }
  }

  const statusStyles = {
    PENDING: 'bg-amber-50 text-amber-600',
    PAID: 'bg-green-50 text-green-600',
    MISSED: 'bg-red-50 text-red-500',
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Repayment Tracking</h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor ongoing loan repayments and identify missed payments.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Repayments
          </button>
          <button
            onClick={() => setFilter('MISSED')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'MISSED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Missed Only
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading repayments...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && repayments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">No repayments found.</p>
        </div>
      )}

      {!loading && repayments.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium px-6 py-4">Deal</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Amount</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Due Date</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {repayments.map((repayment) => {
                const businessName = repayment.deal?.pitch?.businessName || repayment.deal?.bid?.pitch?.businessName || `Deal #${repayment.deal?.id}` || 'N/A'
                
                return (
                  <tr
                    key={repayment.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="text-gray-900 font-medium px-6 py-4">{businessName}</td>
                    <td className="text-gray-900 px-6 py-4">GH₵ {repayment.amount}</td>
                    <td className="text-gray-500 px-6 py-4">{repayment.dueDate?.slice(0, 10)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[repayment.status] || 'bg-gray-100 text-gray-500'}`}>
                        {repayment.status}
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

export default RepaymentTracking
