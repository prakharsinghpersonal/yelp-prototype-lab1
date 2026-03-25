/**
 * History page - View user's reviews and restaurants added
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { getHistory } from '../services/userService'

export default function HistoryPage() {
  const [history, setHistory] = useState({ reviews: [], restaurants: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getHistory()
      .then((res) => setHistory(res.data))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">My History</h1>

      {/* Reviews written */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Reviews Written ({history.reviews?.length || 0})</h2>
        {!history.reviews?.length && (
          <p className="text-gray-500 text-sm">You haven't written any reviews yet.</p>
        )}
        <div className="space-y-3">
          {history.reviews?.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.restaurant_id}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.restaurant_name}</span>
                <StarRating rating={r.rating} size="sm" />
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.comment}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Restaurants added */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Restaurants Added ({history.restaurants?.length || 0})</h2>
        {!history.restaurants?.length && (
          <p className="text-gray-500 text-sm">You haven't added any restaurants yet.</p>
        )}
        <div className="space-y-3">
          {history.restaurants?.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.name}</span>
                <span className="text-sm text-gray-500">{r.cuisine_type}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{r.city} · Added {new Date(r.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
