import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import RestaurantMap from '../components/RestaurantMap'
import {
  getRestaurant, getReviews, createReview, updateReview,
  deleteReview, addFavorite, removeFavorite,
} from '../services/restaurantService'
import api from '../services/api'
import { isLoggedIn } from '../services/authService'
import { getProfile } from '../services/userService'
import MapErrorBoundary from '../components/MapErrorBoundary'

export default function RestaurantDetailsPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewPhoto, setReviewPhoto] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, revRes, photoRes] = await Promise.all([
          getRestaurant(id),
          getReviews(id),
          api.get(`/restaurants/${id}/photos`).catch(() => ({ data: [] })),
        ])
        setRestaurant(rRes.data)
        setReviews(revRes.data)
        setPhotos(photoRes.data)
        if (isLoggedIn()) {
          const me = await getProfile()
          setCurrentUserId(me.data.id)
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
    try {
      if (isFav) { await removeFavorite(id); setIsFav(false) }
      else { await addFavorite(id); setIsFav(true) }
    } catch { /* ignore */ }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      let savedReview
      if (editingId) {
        const res = await updateReview(editingId, reviewForm)
        savedReview = res.data
        setReviews((prev) => prev.map((r) => (r.id === editingId ? savedReview : r)))
        setEditingId(null)
      } else {
        const res = await createReview(id, reviewForm)
        savedReview = res.data
        // Attach photo if selected
        if (reviewPhoto) {
          const fd = new FormData()
          fd.append('file', reviewPhoto)
          await api.post(`/reviews/${savedReview.id}/photos`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }).catch(() => {})
        }
        setReviews((prev) => [savedReview, ...prev])
      }
      setReviewForm({ rating: 5, comment: '' })
      setReviewPhoto(null)
    } catch {
      setError('Failed to submit review.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const startEdit = (review) => {
    setEditingId(review.id)
    setReviewForm({ rating: review.rating, comment: review.comment })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch { setError('Failed to delete review.') }
  }

  if (loading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!restaurant) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark dark:text-white">{restaurant.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <StarRating rating={restaurant.avg_rating || 0} size="md" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {restaurant.avg_rating?.toFixed(1)} ({restaurant.review_count} reviews)
              </span>
              {restaurant.price_tier && (
                <span className="text-gray-500 text-sm">{restaurant.price_tier}</span>
              )}
              {restaurant.cuisine_type && (
                <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {restaurant.cuisine_type}
                </span>
              )}
            </div>
          </div>
          {isLoggedIn() && (
            <button onClick={handleFavorite} className="btn-secondary text-sm">
              {isFav ? '♥ Saved' : '♡ Save'}
            </button>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt={`${restaurant.name} photo`}
                className="h-40 w-full object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* No photos placeholder */}
      {photos.length === 0 && (
        <div className="mb-6 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-5xl">
          🍽️
        </div>
      )}

      {/* Info grid + Map side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 space-y-3">
          {restaurant.address && <InfoRow label="Address" value={restaurant.address} />}
          {restaurant.city && <InfoRow label="City" value={`${restaurant.city}${restaurant.zip ? ` ${restaurant.zip}` : ''}`} />}
          {restaurant.phone && <InfoRow label="Phone" value={restaurant.phone} />}
          {restaurant.hours && <InfoRow label="Hours" value={restaurant.hours} />}
          {restaurant.amenities?.length > 0 && (
            <InfoRow label="Amenities" value={restaurant.amenities.join(', ')} />
          )}
          {restaurant.description && <InfoRow label="About" value={restaurant.description} />}
        </div>

        {/* Map */}
        <div>
          <MapErrorBoundary>
            <RestaurantMap restaurant={restaurant} />
          </MapErrorBoundary>
          {restaurant.address && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(
                [restaurant.name, restaurant.address, restaurant.city].filter(Boolean).join(', ')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#f77f00] hover:underline mt-2 block text-center"
            >
              Open in Google Maps ↗
            </a>
          )}
        </div>
      </div>

      {/* Review form */}
      {isLoggedIn() && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            {editingId ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                    className={`text-2xl transition-colors ${s <= reviewForm.rating ? 'text-[#d62828]' : 'text-gray-300'}`}
                    aria-label={`${s} stars`}
                  >★</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comment
              </label>
              <textarea id="comment" rows={3} className="input"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience..."
              />
            </div>
            {/* Photo attachment */}
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attach Photo <span className="text-gray-400">(optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="btn-secondary text-sm cursor-pointer">
                    {reviewPhoto ? '📷 Change Photo' : '📷 Add Photo'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => setReviewPhoto(e.target.files[0] || null)} />
                  </label>
                  {reviewPhoto && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">{reviewPhoto.name}</span>
                      <button type="button" onClick={() => setReviewPhoto(null)}
                        className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={submitLoading} className="btn-primary">
                {submitLoading ? 'Submitting...' : editingId ? 'Update' : 'Submit Review'}
              </button>
              {editingId && (
                <button type="button"
                  onClick={() => { setEditingId(null); setReviewForm({ rating: 5, comment: '' }) }}
                  className="btn-secondary"
                >Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Reviews ({reviews.length})</h2>
        {reviews.length === 0 && (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
        )}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="font-medium text-sm dark:text-white">{review.user_name || 'User'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {currentUserId === review.user_id && (
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(review)}
                      className="text-xs text-[#f77f00] hover:underline">Edit</button>
                    <button onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
              {review.photo_url && (
                <img src={review.photo_url} alt="Review photo"
                  className="mt-2 rounded-lg max-h-40 object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
    </div>
  )
}
