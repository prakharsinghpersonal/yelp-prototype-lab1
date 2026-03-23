import { useState, useEffect } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import { getFavorites } from '../services/restaurantService'

const ITEMS_PER_PAGE = 10

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const loadFavorites = async (skipVal = 0) => {
    setLoading(true)
    try {
      const res = await getFavorites({ skip: skipVal, limit: ITEMS_PER_PAGE })
      if (skipVal === 0) {
        setFavorites(res.data)
      } else {
        setFavorites((prev) => [...prev, ...res.data])
      }
      setHasMore(res.data.length === ITEMS_PER_PAGE)
    } catch {
      setError('Failed to load favorites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const handleLoadMore = () => {
    const newSkip = skip + ITEMS_PER_PAGE
    setSkip(newSkip)
    loadFavorites(newSkip)
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">❤️ Collections</h1>
          <p className="text-gray-600">Places you've saved and loved</p>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{favorites.length}</span> saved restaurant{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="text-center py-16 bg-red-50 text-red-700 rounded-lg border border-red-200">
            ✗ {error}
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-3">♡</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</p>
            <p className="text-gray-600 mb-6">Explore restaurants and click ♡ to save your favorites</p>
          </div>
        )}

        {/* Grid */}
        {favorites.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {favorites.map((fav) => (
                <RestaurantCard key={fav.id} restaurant={fav.restaurant} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
