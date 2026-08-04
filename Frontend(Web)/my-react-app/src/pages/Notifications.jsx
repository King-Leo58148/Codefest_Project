import React, { useState, useEffect } from 'react'
import { Bell, FileText, Briefcase, CheckCircle, RefreshCw, CheckCheck } from 'lucide-react'
import api from '../api'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/notifications')
      setNotifications(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (item) => {
    const text = (item.title || item.message || item.text || item.body || '').toLowerCase()
    if (text.includes('pitch')) return <FileText size={18} className="text-amber-600" />
    if (text.includes('deal') || text.includes('mfi')) return <Briefcase size={18} className="text-emerald-600" />
    if (text.includes('repayment')) return <CheckCircle size={18} className="text-indigo-600" />
    return <Bell size={18} className="text-slate-600" />
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell size={16} className="text-amber-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications Center</h2>
          </div>
          <p className="text-slate-500 text-sm">Real-time alerts for pitches, deal milestones, and repayments.</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Feed
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-stone-100 animate-pulse rounded-2xl border border-stone-200/60" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-stone-50/60 rounded-3xl border border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <CheckCheck size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">All caught up!</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            There are no unread notifications or pending system alerts requiring your attention right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <div
              key={notif.id || index}
              className="bg-white border border-slate-200/70 hover:border-amber-300 rounded-2xl p-5 shadow-xs transition-all flex items-start gap-4 hover:shadow-sm"
            >
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 shrink-0">
                {getIcon(notif)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {notif.title || notif.businessName || 'System Alert'}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">Just now</span>
                </div>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {notif.message || notif.text || notif.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
