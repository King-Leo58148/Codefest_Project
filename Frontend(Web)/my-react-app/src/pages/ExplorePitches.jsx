import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search, Filter, MapPin, TrendingUp, ArrowUpRight } from 'lucide-react'
import api from '../api'
import BlurFade from '../components/magic/BlurFade'
import Particles from '../components/magic/Particles'

function ExplorePitches() {
  const navigate = useNavigate()
  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('ALL')

  useEffect(() => {
    async function fetchPitches() {
      try {
        const response = await api.get('/api/pitches')
        const data = response.data
        setPitches(Array.isArray(data) ? data : (data?.content || data?.data || []))
      } catch (err) {
        setError('Failed to load available pitches.')
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [])

  const uniqueIndustries = [...new Set((pitches || []).map(p => p?.industry).filter(Boolean))]

  const filteredPitches = (pitches || []).filter(p => {
    const matchesSearch = p?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = industryFilter === 'ALL' || p.industry === industryFilter
    
    return matchesSearch && matchesIndustry
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold tracking-wider mb-4 border border-white/10">
            INVESTMENT OPPORTUNITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Fund local growth
          </h2>
          <p className="text-slate-300 sm:text-lg mb-8">
            Discover verified businesses seeking capital.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Search businesses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-2xl px-4 py-3 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
            />
            <select 
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full sm:w-48 bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 outline-none focus:border-white focus:ring-1 focus:ring-white [&>option]:text-slate-900"
            >
              <option value="ALL">All Industries</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="h-28 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-10 bg-slate-100 rounded-2xl mt-4" />
                <div className="h-10 bg-slate-200 rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filteredPitches.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No pitches available</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {searchTerm || industryFilter !== 'ALL' 
              ? 'Try adjusting your search filters.' 
              : "There are currently no active pitches available for investment."}
          </p>
        </div>
      )}

      {!loading && filteredPitches.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 pt-4">
          {filteredPitches.map((pitch, i) => (
            <motion.div
              key={pitch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
              className="glass-card overflow-hidden flex flex-col cursor-pointer group"
              onClick={() => navigate(`/pitch/${pitch.id}`)}
            >
              {/* Card top accent */}
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
              
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {pitch.industry && (
                      <span className="badge badge-green text-[10px]">{pitch.industry}</span>
                    )}
                    {pitch.location && (
                      <span className="badge badge-slate text-[10px] flex items-center gap-1">
                        <MapPin size={8} /> {pitch.location}
                      </span>
                    )}
                  </div>
                  <span className="badge badge-blue text-[10px] flex-shrink-0">{pitch.status || 'APPROVED'}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {pitch.businessName}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  {pitch.description}
                </p>
              </div>

              <div className="mx-5 mb-4 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
                <p className="text-xs text-slate-500 mb-0.5 font-medium">Funding Goal</p>
                <p className="text-xl font-bold text-slate-900">GH₵ {pitch.amountNeeded?.toLocaleString() || '—'}</p>
              </div>

              <div className="px-5 pb-5 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/pitch/${pitch.id}`) }}
                  className="w-full cta-button flex items-center justify-center gap-2"
                >
                  View & Invest <ArrowUpRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExplorePitches
