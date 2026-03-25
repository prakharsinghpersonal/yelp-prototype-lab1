import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StarRating from '../../components/StarRating'
import api from '../../services/api'

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!data) return null

  const { restaurant, analytics, recent_reviews } = data

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{restaurant?.name}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/owner/restaurant" className="btn-secondary text-sm">Manage Restaurant</Link>
          <Link to="/owner/reviews" className="btn-secondary text-sm">View Reviews</Link>
        </div>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Views" value={analytics?.total_views ?? 0} icon="👁️" />
        <StatCard label="Avg Rating" value={analytics?.avg_rating ? `${analytics.avg_rating.toFixed(1)}★` : '—'} icon="⭐" />
        <StatCard label="Total Reviews" value={analytics?.total_reviews ?? 0} icon="💬" />
        <StatCard label="Favorites" value={analytics?.total_favorites ?? 0} icon="♥" />
      </div>

      {/* Rating distribution */}
      {analytics?.rating_distribution && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#003049] mb-4">Rating Distribution</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = analytics.rating_distribution[star] || 0
              const pct = analytics.total_reviews > 0
                ? Math.round((count / analytics.total_reviews) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm w-8 text-right">{star}★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-[#d62828] h-3 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#003049]">Recent Reviews</h2>
          <Link to="/owner/reviews" className="text-sm text-[#f77f00] hover:underline">View all →</Link>
        </div>
        {!recent_reviews?.length && (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        )}
        <div className="space-y-4">
          {recent_reviews?.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} size="sm" />
                  <span className="text-sm font-medium">{r.user_name}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-[#003049]">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
