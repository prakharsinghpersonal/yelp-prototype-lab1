import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { getRestaurants } from '../services/restaurantService'
import { isLoggedIn } from '../services/authService'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean']

export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ q: '', cuisine_type: '', city: '' })
  const abortControllerRef = useRef(null)
  const isMountedRef = useRef(true)

  const fetchRestaurants = useCallback(async (filtersToUse) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setLoadingTimeout(false)
    setError('')
    
    // Show timeout message if loading takes more than 5 seconds
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        setLoadingTimeout(true)
      }
    }, 5000)
    
    try {
      const params = {}
      if (filtersToUse.q) params.search = filtersToUse.q
      if (filtersToUse.cuisine_type) params.cuisine = filtersToUse.cuisine_type
      if (filtersToUse.city) params.city = filtersToUse.city
      
      // Pass abort signal to request
      const res = await getRestaurants(params, abortControllerRef.current.signal)
      
      if (isMountedRef.current) {
        clearTimeout(timeoutId)
        setRestaurants(res.data || [])
        setLoadingTimeout(false)
      }
    } catch (err) {
      // Only update state if not aborted and component mounted
      if (isMountedRef.current && err.name !== 'AbortError' && err.name !== 'CanceledError') {
        clearTimeout(timeoutId)
        console.error('Failed to load restaurants:', err)
        setError(`Failed to load restaurants: ${err.message}`)
        setRestaurants([])
        setLoadingTimeout(false)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Cleanup on component unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Listen for logout to clear data and cancel requests
  useEffect(() => {
    const handleLogout = () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      setRestaurants([])
    }

    window.addEventListener('logout', handleLogout)
    return () => window.removeEventListener('logout', handleLogout)
  }, [])

  useEffect(() => {
    fetchRestaurants(filters)
  }, [filters, fetchRestaurants])

  const handleSearch = (e) => {
    e.preventDefault()
    // Filters will trigger useEffect automatically
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center h-[550px] flex items-center justify-center -mt-[64px]"
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          paddingTop: '64px' // offset for the global navbar if it sits on top
        }}
      >
        <div className="max-w-4xl mx-auto px-4 w-full text-center text-white relative z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl">
            yelp<span className="text-[#fcbf49] hover:animate-spin inline-block">★</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-10 drop-shadow-lg text-gray-100 hidden sm:block">
            Discover the best food & drinks in your city
          </p>

          {/* Unified Search Bar - Glassmorphism UI */}
          <form 
            onSubmit={handleSearch} 
            className="flex flex-col md:flex-row bg-white/10 backdrop-blur-md border border-white/30 rounded-full shadow-2xl p-2 mx-auto focus-within:ring-4 focus-within:ring-[#fcbf49]/50 transition-all text-base w-full max-w-4xl"
          >
            <div className="flex-1 flex items-center px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-white/20">
              <span className="text-white font-bold mr-3 hidden md:inline tracking-wide uppercase text-xs">Find</span>
              <input
                type="text"
                placeholder="burgers, barbers, spas, handymen..."
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="w-full bg-transparent text-white placeholder-gray-200 font-medium border-none focus:outline-none focus:ring-0 appearance-none"
                aria-label="Search restaurants"
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-3 md:py-2">
              <span className="text-white font-bold mr-3 hidden md:inline tracking-wide uppercase text-xs">Near</span>
              <input
                type="text"
                placeholder="San Francisco, CA"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-transparent text-white placeholder-gray-200 font-medium border-none focus:outline-none focus:ring-0 appearance-none"
                aria-label="Location"
              />
            </div>
            <button 
              type="submit" 
              className="mt-2 md:mt-0 bg-[#e1515f] hover:bg-[#d62828] text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>

          {/* Categories Links (Quick Links) */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold p-2">
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'American' }))} className="bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-gray-900 rounded-full px-4 py-1.5 transition-all flex items-center gap-1">
              🍔 American
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'Italian' }))} className="bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-gray-900 rounded-full px-4 py-1.5 transition-all flex items-center gap-1">
              🍝 Italian
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'Mexican' }))} className="bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-gray-900 rounded-full px-4 py-1.5 transition-all flex items-center gap-1">
              🌮 Mexican
            </button>
            <button onClick={() => setFilters((f) => ({ ...f, cuisine_type: 'Japanese' }))} className="bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-gray-900 rounded-full px-4 py-1.5 transition-all flex items-center gap-1">
              🍣 Japanese
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
              }} 
              className="bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-[#fcbf49] hover:text-gray-900 hover:border-[#fcbf49] rounded-full px-4 py-1.5 transition-all flex items-center gap-1 ml-2"
            >
              Explore More ▾
            </button>
          </div>
        </div>
      </div>

      {/* Categories (Yelp style category boxes) */}
      <div id="categories" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setFilters((f) => ({ ...f, cuisine_type: c }))
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
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">Loading restaurants...</div>
            {loadingTimeout && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 inline-block">
                <p className="mb-3">Taking longer than expected. This might indicate:</p>
                <ul className="text-left mb-4">
                  <li>• Backend server is not running</li>
                  <li>• Network connectivity issue</li>
                  <li>• Database is slow to respond</li>
                </ul>
                <button 
                  onClick={() => fetchRestaurants(filters)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
                >
                  Retry Loading
                </button>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="text-center py-16 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 font-medium mb-3">{error}</div>
            <button 
              onClick={() => fetchRestaurants(filters)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
            >
              Retry Loading
            </button>
          </div>
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
      </div>
    </div>
  )
}
