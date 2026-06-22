import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/pitches', label: 'Pitch Review' },
  { path: '/users', label: 'User Management' },
  { path: '/deals', label: 'Deal Monitoring' },
  { path: '/mfi', label: 'MFI Workflow' },
  { path: '/repayments', label: 'Repayment Tracking' },
  { path: '/notifications', label: 'Notifications' },
]

function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col justify-between py-8 px-4">
        <div>
          <h1 className="text-amber-400 text-2xl font-bold mb-10 px-2">
            Nkɔso Admin
          </h1>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-400 text-gray-900'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-3 text-sm text-gray-400 hover:text-red-400 text-left"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout