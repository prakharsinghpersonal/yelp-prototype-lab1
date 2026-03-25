import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import RestaurantMap from '../components/RestaurantMap'
import MapErrorBoundary from '../components/MapErrorBoundary'
import {
  getRestaurant, getReviews, createReview, updateReview,
  deleteReview, addFavorite, removeFavorite, getFavorites,
} from '../services/restaurantService'
import { isLoggedIn } from '../services/authService'
import { getProfile } from '../services/userService'

const FALLBACK_IMAGES = [
  'http://localhost:8000/uploads/default_heroes/hero1.png',
  'http://localhost:8000/uploads/default_heroes/hero2.png',
  'http://localhost:8000/uploads/default_heroes/hero3.png',
  'http://localhost:8000/uploads/default_heroes/hero4.png',
]

export default function RestaurantDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [editingId, setEditingId] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, revRes] = await Promise.all([getRestaurant(id), getReviews(id)])
        setRestaurant(rRes.data)
        setReviews(revRes.data)
        if (isLoggedIn()) {
          const [me, favs] = await Promise.all([getProfile(), getFavorites()])
          setCurrentUserId(me.data.id)
          setIsFav(favs.data.some((f) => f.restaurant_id === Number(id)))
        }
      } catch {
        setError('Failed to load restaurant.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleFavorite = async () => {
    if (!isLoggedIn()) { navigate('/login'); return }
    try {
      if (isFav) { await removeFavorite(id); setIsFav(false) }
      else { await addFavorite(id); setIsFav(true) }
    } catch {
      setError('Failed to update favorite.')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn()) { navigate('/login'); return }
    setSubmitLoading(true)
    try {
      if (editingId) {
        const res = await updateReview(editingId, reviewForm)
        setReviews((prev) => prev.map((r) => (r.id === editingId ? res.data : r)))
        setEditingId(null)
      } else {
        const res = await createReview(id, reviewForm)
        setReviews((prev) => [res.data, ...prev])
      }
      setReviewForm({ rating: 5, comment: '' })
      setSuccessMsg('Review saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      setError('Failed to submit review.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const startEdit = (review) => {
    setEditingId(review.id)
    setReviewForm({ rating: review.rating, comment: review.comment })
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch {
      setError('Failed to delete review.')
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error && !restaurant) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!restaurant) return null

  const imageUrl = FALLBACK_IMAGES[restaurant.id % FALLBACK_IMAGES.length]

  return (
    <div>
      {/* Hero Image */}
      <div className="relative h-72 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-bold bg-gradient-to-br from-[#d62828] to-[#003049]">
          {restaurant.name}
        </div>
        <img
          src={restaurant.image_url || imageUrl}
          alt={restaurant.name}
          className="relative z-10 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white rounded-full px-3 py-1.5 text-sm font-medium hover:bg-gray-100 shadow-md transition-colors"
        >
          ← Back
        </button>
        {isLoggedIn() && (
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 bg-white rounded-full p-3 hover:bg-gray-100 shadow-md transition-colors"
          >
            <span className="text-2xl">{isFav ? '♥' : '♡'}</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{restaurant.name}</h1>
          <div className="flex items-center gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              <StarRating rating={restaurant.avg_rating || 0} size="md" />
              <span className="text-lg font-semibold text-gray-900">
                {restaurant.avg_rating ? restaurant.avg_rating.toFixed(1) : '—'}
              </span>
              <span className="text-gray-500 text-sm">
                ({restaurant.review_count} {restaurant.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            {restaurant.price_tier && (
              <span className="text-lg text-[#f77f00] font-medium">{restaurant.price_tier}</span>
            )}
          </div>
          {restaurant.cuisine_type && (
            <span className="inline-block bg-[#f77f00]/15 text-[#f77f00] px-4 py-1.5 rounded-full text-sm font-medium">
              {restaurant.cuisine_type}
            </span>
          )}

          {successMsg && (
            <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm">✓ {successMsg}</div>
          )}
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">✗ {error}</div>
          )}
        </div>

        {/* Info Grid + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Hours</h3>
            <div className="space-y-3">
              {restaurant.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">{restaurant.address}</p>
                </div>
              )}
              {restaurant.city && (
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-gray-900 font-medium">{restaurant.city}</p>
                </div>
              )}
              {restaurant.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${restaurant.phone}`} className="text-[#d62828] hover:underline font-medium">
                    {restaurant.phone}
                  </a>
                </div>
              )}
              {restaurant.hours && (
                <div>
                  <p className="text-sm text-gray-500">Hours</p>
                  <p className="text-gray-900 font-medium whitespace-pre-line">{restaurant.hours}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            {restaurant.description ? (
              <p className="text-gray-700 leading-relaxed mb-4">{restaurant.description}</p>
            ) : (
              <p className="text-gray-500 italic mb-4">No description available</p>
            )}
            {/* Map */}
            <MapErrorBoundary>
              <RestaurantMap restaurant={restaurant} />
            </MapErrorBoundary>
            {restaurant.address && (
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(
                  `${restaurant.name} ${restaurant.address} ${restaurant.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-[#d62828] hover:underline"
              >
                Open in Google Maps ↗
              </a>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews</h2>

          {isLoggedIn() && (
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? '✏️ Edit Your Review' : '✍️ Write a Review'}
              </h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="input w-auto"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} ★</option>
                      ))}
                    </select>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < reviewForm.rating ? 'text-amber-400 text-lg' : 'text-gray-300 text-lg'}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows="4"
                    className="input"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitLoading} className="btn-primary">
                    {submitLoading ? 'Saving...' : editingId ? 'Update Review' : 'Post Review'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setReviewForm({ rating: 5, comment: '' }) }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{review.rating} stars</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        by {review.user_name || 'Anonymous'} · {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isLoggedIn() && currentUserId === review.user_id && (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(review)} className="text-sm text-[#d62828] hover:underline font-medium">Edit</button>
                        <button onClick={() => handleDelete(review.id)} className="text-sm text-gray-500 hover:text-red-600 font-medium">Delete</button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
