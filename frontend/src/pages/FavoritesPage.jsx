import { useState, useEffect } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import { getFavorites, removeFavorite } from '../services/restaurantService'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getFavorites()
      .then((res) => setFavorites(res.data))
      .catch(() => setError('Failed to load favorites.'))
      .finally(() => setLoading(false))
  }, [])

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
        {favorites.map((f) => (
          <RestaurantCard 
            key={f.id} 
            restaurant={f.restaurant || f} 
            isFav={true}
            onToggleFav={async () => {
              try {
                await removeFavorite(f.restaurant?.id || f.id);
                setFavorites(prev => prev.filter(item => item.id !== f.id));
              } catch(e) { console.error('Failed to remove favorite', e) }
            }}
          />
        ))}
      </div>
    </div>
  )
}
