import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Building2,
  CreditCard,
  Bell,
  LogOut,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pitches', label: 'Pitch Review', icon: FileText },
  { path: '/users', label: 'User Management', icon: Users },
  { path: '/deals', label: 'Deal Monitoring', icon: Briefcase },
  { path: '/mfi', label: 'MFI Workflow', icon: Building2 },
  { path: '/repayments', label: 'Repayment Tracking', icon: CreditCard },
  { path: '/notifications', label: 'Notifications', icon: Bell },
]

function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between py-8 px-4">
        <div>
          <div className="px-2 mb-10">
            <h1 className="text-xl font-bold text-gray-900">Nkɔso</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout