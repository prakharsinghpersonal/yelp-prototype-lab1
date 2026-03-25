/**
 * Restaurant details page - View restaurant info, reviews, and add reviews
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import {
  getRestaurant,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  addFavorite,
  removeFavorite,
  getFavorites,
  uploadRestaurantPhoto,
  claimRestaurant,
} from '../services/restaurantService'
import { isLoggedIn } from '../services/authService'
import { getProfile } from '../services/userService'

export default function RestaurantDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserRole, setCurrentUserRole] = useState(null)
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
          setCurrentUserRole(me.data.role)
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
    try {
      if (isFav) { await removeFavorite(id); setIsFav(false) }
      else { await addFavorite(id); setIsFav(true) }
    } catch { /* ignore */ }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const res = await uploadRestaurantPhoto(id, file)
      setRestaurant(res.data)
    } catch {
      setError('Failed to upload photo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await claimRestaurant(id)
      setRestaurant(res.data)
      setSuccessMsg("Restaurant claimed successfully! You can now manage it from your Owner Dashboard.")
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to claim restaurant.')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
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
    } catch { setError('Failed to delete review.') }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!restaurant) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {successMsg && (
        <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {successMsg}
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        {restaurant.image_url && (
          <img src={`http://localhost:8000${restaurant.image_url}`} alt={restaurant.name} className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm" />
        )}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">{restaurant.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <StarRating rating={restaurant.avg_rating || 0} size="md" />
              <span className="text-gray-500 text-sm">
                {restaurant.avg_rating?.toFixed(1)} ({restaurant.review_count} reviews)
              </span>
              {restaurant.price_tier && (
                <span className="text-gray-500 text-sm">{restaurant.price_tier}</span>
              )}
              {restaurant.cuisine_type && (
                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">{restaurant.cuisine_type}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn() && currentUserRole === 'owner' && !restaurant.owner_id && (
              <button onClick={handleClaim} className="btn-primary text-sm bg-brand-primary border-brand-primary">
                🏷️ Claim Business
              </button>
            )}
            {isLoggedIn() && currentUserId === restaurant.owner_id && (
              <label className="btn-secondary text-sm cursor-pointer">
                📷 Add Photo
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
            {isLoggedIn() && currentUserRole === 'owner' && currentUserId === restaurant.owner_id && (
              <button onClick={() => navigate('/owner/dashboard')} className="btn-secondary text-sm">
                📊 View Analytics
              </button>
            )}
            {isLoggedIn() && currentUserRole !== 'owner' && (
              <button onClick={handleFavorite} className="btn-secondary text-sm">
                {isFav ? '♥ Saved' : '♡ Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="card p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {restaurant.address && <InfoRow label="Address" value={restaurant.address} />}
        {restaurant.city && <InfoRow label="City" value={restaurant.city} />}
        {restaurant.phone && <InfoRow label="Phone" value={restaurant.phone} />}
        {restaurant.hours && <InfoRow label="Hours" value={restaurant.hours} />}
        {restaurant.description && (
          <div className="md:col-span-2">
            <InfoRow label="About" value={restaurant.description} />
          </div>
        )}
      </div>

      {/* Review form (Only standard users can write reviews, not owners) */}
      {isLoggedIn() && currentUserRole !== 'owner' && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                    className={`text-2xl ${s <= reviewForm.rating ? 'text-yelp-red' : 'text-gray-300'}`}
                    aria-label={`${s} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                id="comment"
                rows={3}
                className="input"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitLoading} className="btn-primary">
                {submitLoading ? 'Submitting...' : editingId ? 'Update' : 'Submit Review'}
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

      {/* Reviews list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
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
                    <span className="font-medium text-sm">{review.user_name || 'User'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {currentUserId === review.user_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(review)}
                      className="text-xs text-brand-teal hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
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
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}
