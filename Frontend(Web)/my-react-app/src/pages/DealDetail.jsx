import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import DealChat from '../components/DealChat'

function DealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  
  const [signing, setSigning] = useState(false)
  const [paying, setPaying] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role)

    async function fetchDeal() {
      try {
        const response = await api.get(`/api/deals/${id}`)
        setDeal(response.data)
      } catch (err) {
        setError('Failed to load deal details.')
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [id])

  const handleSign = async () => {
    setSigning(true)
    setError('')
    setSuccessMsg('')
    try {
      const response = await api.post(`/api/deals/${id}/sign`)
      setDeal(response.data)
      setSuccessMsg('You have successfully signed the agreement.')
    } catch (err) {
      setError('Failed to sign agreement.')
    } finally {
      setSigning(false)
    }
  }

  const handlePayment = async () => {
    setPaying(true)
    setError('')
    setSuccessMsg('')
    try {
      // 1. Initiate payment
      const response = await api.post(`/api/deals/${id}/pay`)
      
      // 2. Redirect to real Paystack checkout
      if (response.data && response.data.paystackUrl) {
        window.location.href = response.data.paystackUrl
      } else {
        setSuccessMsg('Payment initiated. Please check your email for the payment link.')
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading deal room...</p>
      </div>
    )
  }

  if (error && !deal) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Deal Not Found</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="pill-button">
          Go Back
        </button>
      </div>
    )
  }

  const isOwner = userRole === 'BUSINESS_OWNER'
  const isInvestor = userRole === 'INVESTOR'
  const canSign = (isOwner && !deal.ownerSigned) || (isInvestor && !deal.investorSigned)
  const bothSigned = deal.ownerSigned && deal.investorSigned
  
  const businessName = deal.pitch?.businessName || deal.bid?.pitch?.businessName || 'Business'
  const amount = deal.bid?.amount ?? deal.pitch?.amountNeeded ?? 0

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        &larr; Back to Deals
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-semibold text-slate-900">Deal Room</h1>
            <span className="bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              {deal.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-500">Investment agreement for {businessName}</p>
        </div>

        <div className="p-8">
          {successMsg && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 font-medium">
              ✓ {successMsg}
            </div>
          )}
          {error && deal && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12 mb-10">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Deal Terms</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Investment Amount</p>
                  <p className="text-xl font-semibold text-slate-900">GH₵ {amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Return Details</p>
                  <p className="text-base font-medium text-slate-900">
                    {deal.returnValue}% via {deal.returnType?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Timeline</p>
                  <p className="text-base font-medium text-slate-900">{deal.timelineMonths} Months</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Signatures</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">Business Owner</p>
                    <p className="text-sm text-slate-500">{deal.owner?.fullName || 'N/A'}</p>
                  </div>
                  {deal.ownerSigned ? (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">SIGNED</span>
                  ) : (
                    <span className="text-slate-500 text-xs font-semibold">PENDING</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">Investor</p>
                    <p className="text-sm text-slate-500">{deal.investor?.fullName || 'N/A'}</p>
                  </div>
                  {deal.investorSigned ? (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">SIGNED</span>
                  ) : (
                    <span className="text-slate-500 text-xs font-semibold">PENDING</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Actions */}
          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Required Actions</h3>
            
            <div className="flex flex-col gap-4 max-w-sm">
              {canSign && (
                <button 
                  onClick={handleSign} 
                  disabled={signing}
                  className="cta-button"
                >
                  {signing ? 'Signing...' : `Sign Agreement as ${isOwner ? 'Owner' : 'Investor'}`}
                </button>
              )}
              
              {!canSign && !bothSigned && (
                <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 text-sm border border-slate-200">
                  Waiting for the other party to sign the agreement.
                </div>
              )}

              {bothSigned && !deal.paystackRef && isInvestor && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50 text-blue-800 text-sm border border-blue-200">
                    Agreement fully signed. Please proceed to fund the investment.
                  </div>
                  <button 
                    onClick={handlePayment} 
                    disabled={paying}
                    className="cta-button w-full"
                  >
                    {paying ? 'Processing...' : `Pay GH₵ ${amount.toLocaleString()} Now`}
                  </button>
                </div>
              )}

              {bothSigned && !deal.paystackRef && isOwner && (
                <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 text-sm border border-slate-200">
                  Agreement signed. Waiting for the investor to complete payment.
                </div>
              )}

              {deal.paystackRef && (
                <div className="p-4 rounded-2xl bg-green-50 text-green-800 text-sm border border-green-200">
                  <p className="font-semibold mb-1">Payment Completed</p>
                  <p>Transaction Ref: {deal.paystackRef}</p>
                  {deal.disbursedAt && <p className="mt-1">Funds disbursed successfully.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Web Socket Deal Chat */}
      <DealChat dealId={id} />
    </div>
  )
}

export default DealDetail
