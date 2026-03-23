import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { getRestaurants } from '../services/restaurantService'
import { isLoggedIn } from '../services/authService'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean']
const ITEMS_PER_PAGE = 10

export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ q: '', cuisine_type: '', city: '' })
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchRestaurants = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError('')
    try {
      const params = {
        skip: isLoadMore ? skip + ITEMS_PER_PAGE : 0,
        limit: ITEMS_PER_PAGE
      }
      if (filters.q) params.search = filters.q
      if (filters.cuisine_type) params.cuisine = filters.cuisine_type
      if (filters.city) params.city = filters.city
      
      const res = await getRestaurants(params)
      
      if (isLoadMore) {
        setRestaurants((prev) => [...prev, ...res.data])
        setSkip((prev) => prev + ITEMS_PER_PAGE)
      } else {
        setRestaurants(res.data)
        setSkip(0)
      }
      
      // Check if there are more results
      setHasMore(res.data.length === ITEMS_PER_PAGE)
    } catch {
      setError('Failed to load restaurants.')
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }, [filters, skip])

  useEffect(() => {
    fetchRestaurants(false)
  }, [filters])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchRestaurants(false)
  }

  const handleLoadMore = () => {
    fetchRestaurants(true)
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

      {/* Filters */}
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
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-yellow-800">
              ✨ <strong>AI Assistant</strong> — Get personalized restaurant recommendations
            </p>
            <Link to="/chat" className="text-sm font-semibold text-yelp-red hover:underline">
              Open Chat →
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16 text-gray-500">Loading restaurants...</div>
        )}
        {error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl mb-2">No restaurants found</p>
            <p className="text-sm">Try a different search or{' '}
              <Link to="/add-restaurant" className="text-yelp-red hover:underline">
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

        {/* Load More Button */}
        {!loading && !error && restaurants.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-primary"
            >
              {loadingMore ? 'Loading...' : 'Load More Restaurants'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
