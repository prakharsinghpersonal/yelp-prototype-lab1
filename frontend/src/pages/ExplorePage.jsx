import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { getRestaurants } from '../services/restaurantService'
import { isLoggedIn } from '../services/authService'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean']

export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ q: '', cuisine_type: '', city: '' })

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.q) params.q = filters.q
      if (filters.cuisine_type) params.cuisine_type = filters.cuisine_type
      if (filters.city) params.city = filters.city
      const res = await getRestaurants(params)
      setRestaurants(res.data)
    } catch {
      setError('Failed to load restaurants.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchRestaurants()
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-[#003049] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Find Great Restaurants</h1>
          <p className="text-blue-200 mb-6">Discover, review, and share the best places to eat</p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by name, cuisine, or keyword..."
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              className="flex-1 input text-gray-900"
              aria-label="Search restaurants"
            />
            <input
              type="text"
              placeholder="City or zip"
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              className="w-40 input text-gray-900"
              aria-label="Location"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filters — bg-white and border-gray-200 auto-switch via global dark overrides */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-600">Cuisine:</span>
          <button
            onClick={() => setFilters((f) => ({ ...f, cuisine_type: '' }))}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              !filters.cuisine_type
                ? 'bg-[#d62828] text-white border-[#d62828]'
                : 'border-gray-300 hover:border-[#d62828]'
            }`}
          >
            All
          </button>
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setFilters((f) => ({ ...f, cuisine_type: c }))}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                filters.cuisine_type === c
                  ? 'bg-[#d62828] text-white border-[#d62828]'
                  : 'border-gray-300 hover:border-[#d62828]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* AI Chat banner */}
      {isLoggedIn() && (
        <div className="bg-[#fcbf49]/20 border-b border-[#fcbf49]/60 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600">
              ✨ <strong>AI Assistant</strong> — Get personalized restaurant recommendations
            </p>
            <Link to="/chat" className="text-sm font-semibold text-[#d62828] hover:underline">
              Open Chat →
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16 text-brand-dark/60 dark:text-[#eae2b7]/70">Loading restaurants...</div>
        )}
        {error && (
          <div className="text-center py-16 text-[#d62828]">{error}</div>
        )}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16 text-brand-dark/60 dark:text-[#eae2b7]/70">
            <p className="text-xl mb-2">No restaurants found</p>
            <p className="text-sm">Try a different search or{' '}
              <Link to="/add-restaurant" className="text-[#d62828] hover:underline">
                add one
              </Link>
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </div>
    </div>
  )
}
