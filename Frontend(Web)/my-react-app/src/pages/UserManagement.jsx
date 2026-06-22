function UserManagement() {
  const users = [
    {
      id: 1,
      name: 'Ama Owusu',
      role: 'Business Owner',
      verified: true,
      joined: '2026-06-10',
    },
    {
      id: 2,
      name: 'Kofi Mensah',
      role: 'Investor',
      verified: true,
      joined: '2026-06-12',
    },
    {
      id: 3,
      name: 'Abena Asante',
      role: 'Business Owner',
      verified: false,
      joined: '2026-06-18',
    },
    {
      id: 4,
      name: 'Yaw Darko',
      role: 'Investor',
      verified: true,
      joined: '2026-06-19',
    },
  ]

  function handleSuspend(id) {
    alert(`User ${id} suspended`)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-400 text-sm mt-1">
          View and manage all registered users.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium px-6 py-4">Name</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Role</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Verified</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Joined</th>
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
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Investor'
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
                <td className="text-gray-500 px-6 py-4">{user.joined}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSuspend(user.id)}
                    className="bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement