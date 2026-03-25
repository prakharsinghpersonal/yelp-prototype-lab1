/**
 * Favorites page - View user's favorite restaurants with pagination
 */
import { useState, useEffect } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import { getFavorites } from '../services/restaurantService'

const ITEMS_PER_PAGE = 10

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchFavorites = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    try {
      const params = {
        skip: isLoadMore ? skip + ITEMS_PER_PAGE : 0,
        limit: ITEMS_PER_PAGE
      }
      const res = await getFavorites(params)
      
      if (isLoadMore) {
        setFavorites((prev) => [...prev, ...res.data])
        setSkip((prev) => prev + ITEMS_PER_PAGE)
      } else {
        setFavorites(res.data)
        setSkip(0)
      }
      
      setHasMore(res.data.length === ITEMS_PER_PAGE)
    } catch {
      setError('Failed to load favorites.')
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleLoadMore = () => {
    fetchFavorites(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">My Favorites</h1>

      {loading && <div className="text-center py-16 text-gray-500">Loading...</div>}
      {error && <div className="text-center py-16 text-red-500">{error}</div>}
      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl mb-2">No favorites yet</p>
          <p className="text-sm">Browse restaurants and click ♡ Save to add them here.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((fav) => (
          <RestaurantCard key={fav.id} restaurant={fav.restaurant} />
        ))}
      </div>

      {/* Load More Button */}
      {!loading && !error && favorites.length > 0 && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-primary"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
