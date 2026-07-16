import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

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
        setPitches(response.data)
      } catch (err) {
        setError('Failed to load available pitches.')
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [])

  const uniqueIndustries = [...new Set(pitches.map(p => p.industry).filter(Boolean))]

  const filteredPitches = pitches.filter(p => {
    const matchesSearch = p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
        <div className="p-10 flex flex-col items-center justify-center">
          <p className="text-slate-500 font-medium">Loading opportunities...</p>
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 pt-4">
          {filteredPitches.map((pitch) => (
            <div key={pitch.id} className="bg-white rounded-3xl border border-slate-200 flex flex-col shadow-sm hover:shadow-md transition">
              <div className="h-24 bg-slate-50 border-b border-slate-100 rounded-t-3xl p-6 flex items-end">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                  {pitch.businessName}
                </h3>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-2 mb-4">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {pitch.industry || 'General'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Accra
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mb-6 line-clamp-3 flex-1">
                  {pitch.description}
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Funding Goal</p>
                  <p className="text-xl font-semibold text-slate-900">GH₵ {pitch.amountNeeded?.toLocaleString()}</p>
                </div>
                
                <button 
                  onClick={() => navigate(`/pitch/${pitch.id}`)}
                  className="w-full pill-button justify-center"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExplorePitches
