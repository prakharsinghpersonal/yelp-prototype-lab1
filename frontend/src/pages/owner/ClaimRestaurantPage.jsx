import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RestaurantCard from '../../components/RestaurantCard'
import { getRestaurants } from '../../services/restaurantService'
import api from '../../services/api'

export default function ClaimRestaurantPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(''); setSearched(false)
    try {
      const res = await getRestaurants({ q: query })
      setResults(res.data)
      setSearched(true)
    } catch {
      setError('Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (restaurantId) => {
    setClaiming(restaurantId); setError(''); setMessage('')
    try {
      await api.post(`/restaurants/${restaurantId}/claim`)
      setMessage('Restaurant claimed successfully! Redirecting to your dashboard...')
      setTimeout(() => navigate('/owner/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to claim restaurant.')
    } finally {
      setClaiming(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-2">Claim Your Restaurant</h1>
      <p className="text-gray-500 text-sm mb-6">
        Search for your restaurant listing and claim ownership to manage it.
      </p>

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          className="input flex-1"
          placeholder="Search by restaurant name or city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search restaurants to claim"
        />
        <button type="submit" disabled={loading} className="btn-primary px-6">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {searched && results.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No restaurants found for "{query}"</p>
          <p className="text-sm mt-1">Try a different name or check the spelling.</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className="card p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-brand-dark truncate">{r.name}</p>
              <p className="text-sm text-gray-500">{r.cuisine_type} · {r.city}</p>
              {r.owner_id && (
                <p className="text-xs text-orange-500 mt-0.5">Already claimed</p>
              )}
            </div>
            <button
              onClick={() => handleClaim(r.id)}
              disabled={!!r.owner_id || claiming === r.id}
              className="btn-primary text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming === r.id ? 'Claiming...' : r.owner_id ? 'Claimed' : 'Claim'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
