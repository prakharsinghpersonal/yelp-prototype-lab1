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
  claimRestaurant,
  uploadReviewPhoto,
} from '../services/restaurantService'
import { isLoggedIn } from '../services/authService'
import { getProfile } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

// Fallback restaurant images
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
]

export default function RestaurantDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isCustomer, isOwner, user, authReady } = useAuth()
  const { showToast } = useToast()
  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewPhoto, setReviewPhoto] = useState(null)
  const [reviewPhotoPreview, setReviewPhotoPreview] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
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
          const userId = me.data.id
          setCurrentUserId(userId)
          setIsFav(favs.data.some((f) => f.restaurant_id === Number(id)))
          const existingReview = (revRes.data || []).find((review) => review.user_id === userId)
          if (existingReview) {
            setEditingId(existingReview.id)
            setReviewForm({ rating: existingReview.rating, comment: existingReview.comment || '' })
          }
        }
      } catch {
        setError('Failed to load restaurant.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!currentUserId) return
    const existingReview = reviews.find((review) => review.user_id === currentUserId)
    if (!existingReview) return
    if (editingId === existingReview.id) return
    setEditingId(existingReview.id)
    setReviewForm({ rating: existingReview.rating, comment: existingReview.comment || '' })
  }, [reviews, currentUserId, editingId])

  const handleFavorite = async () => {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }
    try {
      if (isFav) {
        await removeFavorite(id)
        setIsFav(false)
        showToast('Removed from favorites.')
      } else {
        await addFavorite(id)
        setIsFav(true)
        showToast('Added to favorites.')
      }
    } catch (err) {
      setError('Failed to update favorite')
      showToast('Failed to update favorite.', 'error')
    }
  }

  const handleClaimRestaurant = async () => {
    setClaimLoading(true)
    setError('')
    try {
      await claimRestaurant(id)
      setRestaurant((current) => ({ ...current, owner_id: user?.id }))
      showToast('Restaurant claimed successfully.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to claim restaurant.')
      showToast(err.response?.data?.detail || 'Failed to claim restaurant.', 'error')
    } finally {
      setClaimLoading(false)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn() || !isCustomer) {
      navigate('/login')
      return
    }
    setSubmitLoading(true)
    try {
      let savedReview
      if (editingId) {
        const res = await updateReview(editingId, reviewForm)
        savedReview = res.data
        setReviews((prev) => prev.map((r) => (r.id === editingId ? savedReview : r)))
      } else {
        const res = await createReview(id, reviewForm)
        savedReview = res.data
        setReviews((prev) => [savedReview, ...prev])
      }
      if (reviewPhoto && savedReview?.id) {
        const photoRes = await uploadReviewPhoto(savedReview.id, reviewPhoto)
        setReviews((prev) => prev.map((r) => (r.id === savedReview.id ? photoRes.data : r)))
      }
      setEditingId(savedReview.id)
      setReviewForm({ rating: savedReview.rating, comment: savedReview.comment || '' })
      setReviewPhoto(null)
      setReviewPhotoPreview('')
      setError('')
      setSuccessMsg('Review saved successfully!')
      showToast('Review saved successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to submit review.'
      if (message === 'You already reviewed this restaurant' && currentUserId) {
        const existingReview = reviews.find((review) => review.user_id === currentUserId)
        if (existingReview) {
          setEditingId(existingReview.id)
          setReviewForm({ rating: existingReview.rating, comment: existingReview.comment || '' })
          setReviewPhoto(null)
          setReviewPhotoPreview('')
          setError('You already reviewed this restaurant. Your existing review is loaded below for editing.')
          showToast('Loaded your existing review for editing.', 'error')
          return
        }
      }
      setError(message)
      showToast(message, 'error')
    } finally {
      setSubmitLoading(false)
    }
  }

  const startEdit = (review) => {
    setEditingId(review.id)
    setReviewForm({ rating: review.rating, comment: review.comment })
    setReviewPhoto(null)
    setReviewPhotoPreview('')
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      showToast('Review deleted.')
    } catch {
      setError('Failed to delete review.')
      showToast('Failed to delete review.', 'error')
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error && !restaurant) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!restaurant) return null

  const imageUrl = FALLBACK_IMAGES[restaurant.id % FALLBACK_IMAGES.length]

  return (
    <div className="bg-white">
      {/* Hero Image Section */}
      <div className="relative h-96 bg-gray-200 overflow-hidden">
        {/* Fallback text (Behind image) */}
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white text-5xl font-bold bg-gradient-to-br from-[#e1515f] to-[#d62828]">
          {restaurant.name}
        </div>
        
        <img 
          src={restaurant.image_url || imageUrl} 
          alt={restaurant.name} 
          className="relative z-10 w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md transition-colors"
        >
          ← Back
        </button>

        {isOwner && user?.id === restaurant.owner_id && (
          <button
            onClick={() => navigate(`/owner/restaurants/${restaurant.id}/edit`)}
            className="absolute top-4 left-24 bg-white rounded-full px-4 py-3 hover:bg-gray-100 shadow-md transition-colors text-sm font-semibold text-gray-700"
          >
            Edit Listing
          </button>
        )}
        
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Info */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{restaurant.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
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
                  <span className="text-lg text-gray-700">
                    {restaurant.price_tier}
                  </span>
                )}
              </div>
            </div>
            {authReady && !isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={handleFavorite}
                  className="rounded-full border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2"
                >
                  <span className="text-2xl">{isFav ? '♥' : '♡'}</span>
                  <span className="text-sm font-semibold text-gray-700">{isFav ? 'Saved' : 'Save'}</span>
                </button>
                {isOwner && !restaurant.owner_id && (
                  <button
                    onClick={handleClaimRestaurant}
                    disabled={claimLoading}
                    className="rounded-full border border-[#e1515f] bg-white px-4 py-3 hover:bg-red-50 shadow-sm transition-colors text-sm font-semibold text-[#e1515f] disabled:opacity-60"
                  >
                    {claimLoading ? 'Claiming...' : 'Claim Restaurant'}
                  </button>
                )}
              </div>
            )}
            {authReady && isOwner && !restaurant.owner_id && (
              <button
                onClick={handleClaimRestaurant}
                disabled={claimLoading}
                className="rounded-full border border-[#e1515f] bg-white px-4 py-3 hover:bg-red-50 shadow-sm transition-colors text-sm font-semibold text-[#e1515f] disabled:opacity-60"
              >
                {claimLoading ? 'Claiming...' : 'Claim Restaurant'}
              </button>
            )}
          </div>

          {/*Tags */}
          {restaurant.cuisine_type && (
            <div className="mb-3">
              <span className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                {restaurant.cuisine_type}
              </span>
            </div>
          )}

          {/* Success/Error Messages */}
          {successMsg && (
            <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm">
              ✓ {successMsg}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
              ✗ {error}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Location & Contact */}
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
                  <a href={`tel:${restaurant.phone}`} className="text-[#e1515f] hover:underline font-medium">
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

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            {restaurant.description ? (
              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews</h2>

          {/* Review Form */}
          {isCustomer && (
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? '✏️ Edit Your Review' : '✍️ Write a Review'}
              </h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label htmlFor="review-rating" className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2 items-center">
                    <select
                      id="review-rating"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#e1515f] focus:border-transparent"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} ★
                        </option>
                      ))}
                    </select>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < reviewForm.rating ? 'text-amber-400 text-lg' : 'text-gray-300 text-lg'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    id="review-comment"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows="4"
                    className="input"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="review-photo" className="block text-sm font-medium text-gray-700 mb-2">Review Photo</label>
                  <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 hover:border-[#e1515f] hover:text-[#e1515f]">
                    <input
                      id="review-photo"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setReviewPhoto(file)
                        setReviewPhotoPreview(URL.createObjectURL(file))
                      }}
                    />
                    {reviewPhotoPreview ? 'Change review photo' : 'Attach an optional review photo'}
                  </label>
                  {reviewPhotoPreview && (
                    <img src={reviewPhotoPreview} alt="Review preview" className="mt-3 h-40 w-full rounded-2xl object-cover border border-gray-200" />
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitLoading || !reviewForm.comment.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? 'Saving...' : editingId ? 'Update Review' : 'Post Review'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setReviewForm({ rating: 5, comment: '' })
                        setReviewPhoto(null)
                        setReviewPhotoPreview('')
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
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
                            <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{review.rating} stars</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        by {review.user_name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isCustomer && currentUserId === review.user_id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(review)}
                          className="text-sm text-[#e1515f] hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-sm text-gray-500 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {review.photo_urls?.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {review.photo_urls.map((photoUrl) => (
                        <img
                          key={photoUrl}
                          src={`http://localhost:8000${photoUrl}`}
                          alt="Review attachment"
                          className="h-40 w-full rounded-2xl object-cover border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
          {isOwner && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Owner accounts can monitor customer feedback here, but customer-only actions like favorites and posting reviews are disabled.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
