import { useState } from 'react'
import { Send } from 'lucide-react'

function Notifications() {
  const [target, setTarget] = useState('all')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend(e) {
    e.preventDefault()
    setSent(true)
    setMessage('')
    setUserId('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="text-gray-400 text-sm mt-1">
          Send alerts and updates to users on the platform.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-xl">
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
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 text-sm"
                placeholder="Enter user ID"
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
    </div>
  )
}

export default Notifications