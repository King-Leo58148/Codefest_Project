import { useState } from 'react'
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
  Search,
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleLogout() {
    localStorage.removeItem('accesstoken')
    localStorage.removeItem('refreshtoken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('token')
    navigate('/')
  }

  function handleSearchToggle() {
    setSearchOpen((prev) => !prev)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    if (query.includes('user')) {
      navigate('/users')
    } else if (query.includes('deal')) {
      navigate('/deals')
    } else if (query.includes('pitch') || query.includes('approval')) {
      navigate('/pitches')
    } else if (query.includes('repay')) {
      navigate('/repayments')
    } else if (query.includes('notification') || query.includes('alert')) {
      navigate('/notifications')
    } else {
      navigate('/dashboard')
    }

    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="hidden lg:flex w-80 flex-col border-r border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-3 py-2 text-white shadow-lg shadow-slate-900/10">
              <LayoutDashboard size={18} />
              <span className="text-sm font-semibold">Nkɔso Admin</span>
            </div>
            <p className="mt-4 text-sm text-slate-500">Manage pitches, deals, users, and repayments from one central console.</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">Ready to deploy</p>
            <p className="mt-2 text-sm text-slate-500">Use the panel to stay on top of platform activity and approvals.</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Admin Portal</p>
              <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={handleSearchToggle}
                className="pill-button w-full sm:w-auto"
              >
                <Search size={16} />
                Search
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search users, deals, pitches..."
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
                <div className="flex gap-3 sm:w-auto">
                  <button
                    type="submit"
                    className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                  >
                    Go
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </header>

          <main className="min-h-[calc(100vh-88px)] p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout