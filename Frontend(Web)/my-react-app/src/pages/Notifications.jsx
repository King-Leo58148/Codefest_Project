import { useState } from 'react'

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
      <h2 className="text-2xl font-bold text-white mb-8">Notifications</h2>

      <div className="bg-gray-900 rounded-xl p-8 max-w-xl">
        {sent && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            Notification sent successfully
          </div>
        )}

        <form onSubmit={handleSend} className="flex flex-col gap-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Send To
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Users</option>
              <option value="specific">Specific User</option>
            </select>
          </div>

          {target === 'specific' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-amber-400"
                placeholder="Enter user ID"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-amber-400 resize-none"
              placeholder="Type your notification message here..."
            />
          </div>

          <button
            type="submit"
            className="bg-amber-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-amber-300 transition-colors"
          >
            Send Notification
          </button>
        </form>
      </div>
    </div>
  )
}

export default Notifications