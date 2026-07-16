import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function MyPitches() {
  const navigate = useNavigate()
  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchPitches() {
      try {
        const response = await api.get('/api/pitches/my-pitches')
        setPitches(response.data)
      } catch (err) {
        setError('Failed to load your pitches.')
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [])

  const filteredPitches = pitches.filter(p => 
    p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My Pitches</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track the status of your funding requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Search pitches..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          <button onClick={() => navigate('/create-pitch')} className="cta-button shrink-0 py-2">
            New Pitch
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-10 flex flex-col items-center justify-center">
          <p className="text-slate-500 text-sm font-medium">Loading your pitches...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filteredPitches.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No pitches found</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search terms.' : "You haven't submitted any pitches yet. Create your first pitch to start raising funds."}
          </p>
          {!searchTerm && (
            <button onClick={() => navigate('/create-pitch')} className="cta-button">
              Create Your First Pitch
            </button>
          )}
        </div>
      )}

      {!loading && filteredPitches.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPitches.map((pitch) => (
            <div key={pitch.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 mb-2">
                    {pitch.industry || 'General'}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                    {pitch.businessName}
                  </h3>
                </div>
                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                  {pitch.status}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
                {pitch.description}
              </p>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Amount Needed</span>
                  <span className="font-medium text-slate-900">GH₵ {pitch.amountNeeded?.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={() => navigate(`/pitch/${pitch.id}`)}
                  className="w-full pill-button justify-center mt-2"
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

export default MyPitches
