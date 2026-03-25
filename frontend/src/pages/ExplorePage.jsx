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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center h-[500px] flex items-center justify-center -mt-[64px]"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          paddingTop: '64px' // offset for the global navbar if it sits on top
        }}
      >
        <div className="max-w-4xl mx-auto px-4 w-full text-center text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
            yelp<span className="text-[#fcbf49]">★</span>
          </h1>

          {/* Unified Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl mx-auto focus-within:ring-4 focus-within:ring-red-500/30"
          >
            <div className="flex-1 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-300">
              <span className="text-gray-900 font-bold mr-2 hidden md:inline">Find</span>
              <input
                type="text"
                placeholder="burgers, barbers, spas, handymen..."
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="w-full text-gray-900 outline-none placeholder-gray-500 font-medium"
                aria-label="Search restaurants"
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-3 md:py-0">
              <span className="text-gray-900 font-bold mr-2 hidden md:inline">Near</span>
              <input
                type="text"
                placeholder="San Francisco, CA"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full text-gray-900 outline-none placeholder-gray-500 font-medium"
                aria-label="Location"
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#d62828] hover:bg-red-800 text-white px-8 py-4 md:py-4 font-bold transition-colors flex items-center justify-center cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Categories Links (Quick Links) */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-semibold">
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'American' }))} className="hover:underline flex items-center gap-1">
              🍔 Restaurants
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'Italian' }))} className="hover:underline flex items-center gap-1">
              🍝 Italian
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'Mexican' }))} className="hover:underline flex items-center gap-1">
              🌮 Mexican
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'Japanese' }))} className="hover:underline flex items-center gap-1">
              🍣 Japanese
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: '' }))} className="hover:underline flex items-center gap-1">
              Explore More ▾
            </button>
          </div>
        </div>
      </div>

      {/* Categories (Yelp style category boxes) */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setFilters((f) => ({ ...f, cuisine_type: c }));
                fetchRestaurants(false);
              }}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                filters.cuisine_type === c
                  ? 'border-[#d62828] bg-red-50 text-[#d62828] shadow-sm'
                  : 'border-gray-200 bg-white hover:shadow-md text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className="text-sm font-semibold text-center">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Separator / Recent Activity Header */}
      <div className="max-w-7xl mx-auto px-4 pb-4 pt-6 text-center border-t border-gray-200">
        <h2 className="text-2xl font-bold text-[#d62828] mb-1">Recommended Restaurants</h2>
        <p className="text-sm text-gray-500 mb-8">Discover top-rated places around you based on recent activity</p>
      </div>


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
