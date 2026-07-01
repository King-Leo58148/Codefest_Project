import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import { Client } from '@stomp/stompjs'
import api from '../api'
import BASE_URL from '../config'

function Notifications() {
  const [target, setTarget] = useState('all')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const [listResponse, unreadResponse] = await Promise.all([
          api.get('/notifications'),
          api.get('/notifications/unread-count'),
        ])
        setNotifications(listResponse.data)
        setUnreadCount(unreadResponse.data.unread || 0)
      } catch (err) {
        console.error('Unable to fetch notifications', err)
      }
    }

    loadNotifications()

    let client
    const token = localStorage.getItem('accesstoken')
    if (!token) return

    client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // eslint-disable-next-line no-console
        console.debug('[STOMP]', str)
      },
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const newNotification = JSON.parse(message.body)
            setNotifications((current) => [newNotification, ...current])
            setUnreadCount((current) => current + 1)
          } catch (err) {
            console.error('Failed to parse notification payload', err)
          }
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
      },
    })

    client.activate()

    return () => {
      if (client) {
        client.deactivate()
      }
    }
  }, [])

  async function handleSend(e) {
    e.preventDefault()

    try {
      await api.post('/notifications/send', {
        target,
        email: target === 'specific' ? email : undefined,
        message,
      })

      setSent(true)
      setMessage('')
      setEmail('')
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      console.error('Failed to send notification', err)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-400 text-sm mt-1">
              Real-time notifications will appear here as they arrive.
            </p>
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
            Unread: {unreadCount}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm">
              Notification sent successfully.
            </div>
          )}

          <form onSubmit={handleSend} className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Send To
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 text-sm"
              >
                <option value="all">All Users</option>
                <option value="specific">Specific User</option>
              </select>
            </div>

            {target === 'specific' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  User Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 text-sm"
                  placeholder="Enter user email"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 text-sm resize-none"
                placeholder="Type your notification message here..."
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-amber-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors"
            >
              <Send size={16} />
              Send Notification
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet. Real-time updates will appear here.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-500">{notification.type}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications