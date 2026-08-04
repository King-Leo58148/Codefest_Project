import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, FileText, Users, Briefcase,
  Building2, CreditCard, Bell, LogOut, Search,
  PlusCircle, TrendingUp, Activity, User, Menu, X, ChevronRight, Globe
} from 'lucide-react'
import BorderBeam from './magic/BorderBeam'

function Layout() {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [role, setRole] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const currentRole = localStorage.getItem('userRole') || 'ADMIN'
    const name = localStorage.getItem('userName') || ''
    setRole(currentRole)
    setUserName(name)
  }, [])

  function handleLogout() {
    localStorage.removeItem('accesstoken')
    localStorage.removeItem('refreshtoken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    navigate('/')
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    const lower = query.toLowerCase()
    
    if (role === 'ADMIN') {
      if (lower.includes('deal') || lower.includes('invest') || lower.includes('capital')) {
        navigate(`/deals?search=${encodeURIComponent(query)}`)
      } else if (lower.includes('pitch') || lower.includes('approval') || lower.includes('business')) {
        navigate(`/pitches?search=${encodeURIComponent(query)}`)
      } else if (lower.includes('repay') || lower.includes('return') || lower.includes('yield')) {
        navigate(`/repayments?search=${encodeURIComponent(query)}`)
      } else if (lower.includes('mfi') || lower.includes('workflow') || lower.includes('legal')) {
        navigate(`/mfi?search=${encodeURIComponent(query)}`)
      } else {
        // Default search across users / platform items
        navigate(`/users?search=${encodeURIComponent(query)}`)
      }
    } else {
      navigate('/dashboard')
    }
    setSearchOpen(false)
    setMobileOpen(false)
  }

  const getNavItems = () => {
    const shared = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/presentation', label: 'App Presentation', icon: Globe },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
    if (role === 'ADMIN') return [
      ...shared,
      { path: '/pitches', label: 'Pitch Review', icon: FileText },
      { path: '/users', label: 'User Management', icon: Users },
      { path: '/deals', label: 'Deal Monitoring', icon: Briefcase },
      { path: '/mfi', label: 'MFI Workflow', icon: Building2 },
      { path: '/repayments', label: 'Repayment Tracking', icon: CreditCard },
    ]
    if (role === 'BUSINESS_OWNER') return [
      ...shared,
      { path: '/create-pitch', label: 'Create Pitch', icon: PlusCircle },
      { path: '/my-pitches', label: 'My Pitches', icon: FileText },
      { path: '/my-deals', label: 'My Deals', icon: Briefcase },
    ]
    if (role === 'INVESTOR') return [
      ...shared,
      { path: '/explore', label: 'Explore Pitches', icon: TrendingUp },
      { path: '/my-bids', label: 'My Bids', icon: Activity },
      { path: '/my-deals', label: 'My Deals', icon: Briefcase },
    ]
    return shared
  }

  const navItems = getNavItems()
  const portalLabel = role === 'ADMIN' ? 'Admin Portal' : role === 'BUSINESS_OWNER' ? 'Owner Portal' : 'Investor Portal'
  const roleAccent = role === 'ADMIN' ? '#f59e0b' : role === 'BUSINESS_OWNER' ? '#10b981' : '#3b82f6'

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Nkɔso</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: roleAccent }}>{portalLabel}</p>
          </div>
        </div>
      </div>

      <div className="h-px mx-5 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.3, ease: 'easeOut' }}
            >
              <NavLink
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive ? 'bg-emerald-500/20' : 'group-hover:bg-white/5'
                    }`}>
                      <Icon size={16} className={isActive ? 'text-emerald-400' : ''} />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="h-px mx-5 my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-1">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <User size={15} />
          </div>
          <span>{userName || 'My Profile'}</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <LogOut size={15} />
          </div>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 z-30"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            style={{ background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200/80 px-5 py-3.5 flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">{portalLabel}</p>
            <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">
              Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {role === 'ADMIN' && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="pill-button"
              >
                <Search size={14} />
                Search
              </button>
            )}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-500 hover:border-red-200 transition-all"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && role === 'ADMIN' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-slate-200 bg-slate-50"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-5 py-3">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users, deals, pitches, repayments..."
                  className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm outline-none"
                />
                <button type="submit" className="cta-button py-2 px-4 text-sm">Go</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition">
                  <X size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout