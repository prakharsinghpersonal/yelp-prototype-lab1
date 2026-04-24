import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerDashboard } from '../services/restaurantService'
import StarRating from '../components/StarRating'
import { useToast } from '../contexts/ToastContext'

export default function OwnerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await getOwnerDashboard()
        setDashboardData(res.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load owner dashboard.')
        showToast('Failed to load owner dashboard.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [showToast])

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-3 text-red-600">Owner Dashboard Unavailable</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  const { restaurant, analytics, recent_reviews, all_restaurants } = dashboardData || {}
  const featuredRestaurant = restaurant || all_restaurants?.[0] || null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Manage restaurants, read reviews, and update your listings.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/owner/restaurants/new" className="btn-primary">Add Restaurant</Link>
          <Link to="/owner/reviews" className="btn-secondary">View Reviews</Link>
          <Link to="/owner/profile" className="btn-secondary">Owner Profile</Link>
        </div>
      </div>

      {!featuredRestaurant ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-xl font-semibold text-gray-900">No restaurant yet</p>
          <p className="mt-2 text-gray-500">Add or claim a restaurant to unlock owner management tools.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard label="Restaurants" value={analytics?.restaurant_count ?? all_restaurants?.length ?? 0} />
            <StatCard label="Views" value={analytics?.total_views ?? 0} />
            <StatCard label="Reviews" value={analytics?.total_reviews ?? 0} />
            <StatCard label="Favorites" value={analytics?.total_favorites ?? 0} />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{featuredRestaurant.name}</h2>
                  <p className="text-sm text-gray-500">{featuredRestaurant.cuisine_type} · {featuredRestaurant.city}</p>
                  <p className="mt-1 text-xs text-gray-500">Featured listing with totals aggregated across all owned restaurants.</p>
                </div>
                <div className="flex gap-3">
                  <Link to={`/owner/restaurants/${featuredRestaurant.id}/edit`} className="text-sm font-semibold text-[#e1515f] hover:underline">
                    Edit listing
                  </Link>
                  <Link to={`/restaurants/${featuredRestaurant.id}`} className="text-sm font-semibold text-[#e1515f] hover:underline">
                    Open public page
                  </Link>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <StarRating rating={analytics?.avg_rating || 0} size="sm" />
                <span className="text-sm font-semibold text-gray-900">
                  {(analytics?.avg_rating || 0).toFixed(1)}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Restaurants</h3>
              <div className="flex flex-wrap gap-2">
                {(all_restaurants || []).map((item) => (
                  <Link
                    key={item.id}
                    to={`/owner/restaurants/${item.id}/edit`}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-[#e1515f] hover:text-[#e1515f]"
                  >
                    {item.name} · {item.avg_rating?.toFixed(1) ?? '0.0'}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {(recent_reviews || []).length ? recent_reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.user_name}</p>
                        <p className="text-xs text-gray-500">{review.restaurant_name}</p>
                      </div>
                      <p className="text-xs text-gray-500">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <p className="mt-2 text-sm text-[#e1515f] font-semibold">{review.rating} / 5</p>
                    <p className="mt-2 text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 break-words">{value}</p>
    </div>
  )
}
