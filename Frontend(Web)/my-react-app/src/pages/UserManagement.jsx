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
  ]

  function handleSuspend(id) {
    alert(`User ${id} suspended`)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">User Management</h2>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 px-6 py-4">Name</th>
              <th className="text-left text-gray-400 px-6 py-4">Role</th>
              <th className="text-left text-gray-400 px-6 py-4">Verified</th>
              <th className="text-left text-gray-400 px-6 py-4">Joined</th>
              <th className="text-left text-gray-400 px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800">
                <td className="text-white px-6 py-4">{user.name}</td>
                <td className="text-gray-400 px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  {user.verified ? (
                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-gray-500/10 text-gray-400 px-3 py-1 rounded-full text-xs">
                      Unverified
                    </span>
                  )}
                </td>
                <td className="text-gray-400 px-6 py-4">{user.joined}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSuspend(user.id)}
                    className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs hover:bg-red-500/20"
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