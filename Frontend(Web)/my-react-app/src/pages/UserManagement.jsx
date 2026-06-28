import { useState, useEffect } from 'react'
import api from '../api'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('/api/admin/users')
        setUsers(response.data)
      } catch (err) {
        setError('Failed to load users.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  async function handleSuspend(id) {
    try {
      await api.put(`/api/admin/users/${id}/suspend`)
      setUsers(users.map((u) =>
        u.id === id ? { ...u, suspended: true } : u
      ))
    } catch (err) {
      alert('Failed to suspend user.')
    }
  }

  async function handleUnsuspend(id) {
    try {
      await api.put(`/api/admin/users/${id}/unsuspend`)
      setUsers(users.map((u) =>
        u.id === id ? { ...u, suspended: false } : u
      ))
    } catch (err) {
      alert('Failed to unsuspend user.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-400 text-sm mt-1">
          View and manage all registered users.
        </p>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading users...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">No users found.</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium px-6 py-4">Name</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Role</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Verified</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="text-gray-900 font-medium px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                        {user.fullName?.charAt(0) || '?'}
                      </div>
                      {user.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'INVESTOR'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-purple-50 text-purple-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.verified ? (
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="text-gray-500 px-6 py-4">
                    {user.createdAt?.slice(0, 10)}
                  </td>
                  <td className="px-6 py-4">
                    {user.suspended ? (
                      <button
                        onClick={() => handleUnsuspend(user.id)}
                        className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Suspend
                      </button>
                    )}
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

export default UserManagement