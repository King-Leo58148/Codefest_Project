import { useState, useEffect } from 'react'
import api from '../api'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const response = await api.get('/api/notifications')
      const data = response.data
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id) {
    try {
      await api.put(`/api/notifications/${id}/read`)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
    } catch (err) {
      alert('Failed to mark notification as read.')
    }
  }

  async function markAllAsRead() {
    try {
      await api.put('/api/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      alert('Failed to mark all as read.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-400 text-sm mt-1">
            View updates on deals, users, and pitches.
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading notifications...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">You have no notifications.</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 rounded-2xl border ${
                notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
              } shadow-sm transition-colors flex justify-between items-start`}
            >
              <div>
                <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-900' : 'text-blue-900'}`}>
                  {notification.title || 'New Notification'}
                </h4>
                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-blue-800'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                </p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1 bg-white rounded-md border border-blue-200"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
