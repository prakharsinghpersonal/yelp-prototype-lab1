import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/restaurants/owner/reviews')
        setReviews(res.data || [])
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load owner reviews.')
        showToast('Failed to load owner reviews.', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  if (loading) return <div className="py-20 text-center text-gray-500">Loading reviews...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Owners can read feedback but cannot edit customer reviews.</p>
        </div>
        <Link to="/owner/dashboard" className="btn-secondary text-sm">Back to Dashboard</Link>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!reviews.length ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No reviews yet for your restaurants.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{review.restaurant_name}</p>
                  <p className="text-sm text-gray-500">By {review.user_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#e1515f]">{review.rating} / 5</p>
                  <p className="text-xs text-gray-400">{review.created_at ? new Date(review.created_at).toLocaleString() : 'Unknown date'}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">{review.comment || 'No comment provided.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
