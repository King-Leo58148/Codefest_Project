import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, Search, UserCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'

function UserManagement() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('search') || ''

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [roleFilter, setRoleFilter] = useState('ALL')

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('/api/admin/users')
        const data = response.data
        setUsers(Array.isArray(data) ? data : [])
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

  const filteredUsers = users.filter((u) => {
    const nameStr = `${u.fullName || ''} ${u.email || ''} ${u.role || ''}`.toLowerCase()
    const matchesSearch = !searchQuery.trim() || nameStr.includes(searchQuery.trim().toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'INVESTOR':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200/60'
      case 'BUSINESS_OWNER':
        return 'bg-amber-50 text-amber-900 border-amber-200/60'
      case 'MFI_OFFICER':
      case 'MFI':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users size={16} className="text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h2>
            </div>
            <p className="text-slate-500 text-sm">View, filter, and control account permissions for registered platform users.</p>
          </div>
          <span className="badge badge-amber text-sm font-semibold">{filteredUsers.length} Users Found</span>
        </div>
      </BlurFade>

      {/* Filter and Search Bar */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>

          {/* Role Segment Tabs */}
          <div className="inline-flex bg-stone-100/80 p-1 rounded-xl border border-stone-200/80 w-full sm:w-auto">
            {['ALL', 'INVESTOR', 'BUSINESS_OWNER', 'MFI_OFFICER'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-1 sm:flex-none text-center ${
                  roleFilter === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </BlurFade>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-stone-100 animate-pulse rounded-2xl border border-stone-200/60" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-16 bg-stone-50/60 rounded-3xl border border-dashed border-slate-200 p-8">
          <p className="text-slate-500 text-sm font-semibold">No registered users matched "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); }}
            className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* User Data Table */}
      {!loading && filteredUsers.length > 0 && (
        <BlurFade delay={0.1}>
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-stone-50/50">
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">User Identity</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Role</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Verification</th>
                    <th className="text-left text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Status</th>
                    <th className="text-right text-slate-400 font-semibold px-6 py-3.5 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0">
                            {(user.fullName || user.email)?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.fullName || 'Unnamed User'}</p>
                            <p className="text-slate-400 text-[11px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${getRoleBadgeStyle(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.verified ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 border border-stone-200 px-2.5 py-0.5 rounded-md font-medium text-[11px]">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.suspended ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                            <ShieldAlert size={12} /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.suspended ? (
                          <button
                            onClick={() => handleUnsuspend(user.id)}
                            className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
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
          </div>
        </BlurFade>
      )}
    </div>
  )
}

export default UserManagement