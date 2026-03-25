import { useState, useEffect } from 'react'
import StarRating from '../../components/StarRating'
import api from '../../services/api'

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Rated', value: 'highest' },
  { label: 'Lowest Rated', value: 'lowest' },
]

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('newest')
  const [filterRating, setFilterRating] = useState(0)

  useEffect(() => {
    api.get('/owner/reviews')
      .then((res) => setReviews(res.data))
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reviews
    .filter((r) => filterRating === 0 || r.rating === filterRating)
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sort === 'highest') return b.rating - a.rating
      if (sort === 'lowest') return a.rating - b.rating
      return 0
    })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <div className="text-center py-20 text-gray-500">Loading reviews...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-1">Customer Reviews</h1>
      {avgRating && (
        <div className="flex items-center gap-2 mb-6">
          <StarRating rating={parseFloat(avgRating)} size="md" />
          <span className="text-gray-600 text-sm">{avgRating} average · {reviews.length} total</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="input w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort reviews"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="flex gap-1">
          <button
            onClick={() => setFilterRating(0)}
            className={`px-3 py-2 rounded-md text-sm border transition-colors ${
              filterRating === 0 ? 'bg-[#003049] text-white border-[#003049]' : 'border-gray-300'
            }`}
          >All</button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button key={s}
              onClick={() => setFilterRating(filterRating === s ? 0 : s)}
              className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                filterRating === s ? 'bg-[#d62828] text-white border-[#d62828]' : 'border-gray-300'
              }`}
            >{s}★</button>
          ))}
        </div>
      </div>

      {/* Read-only notice */}
      <div className="bg-[#eae2b7]/50 border border-[#fcbf49] rounded-md p-3 mb-4 text-sm text-brand-dark">
        ℹ️ Reviews are read-only. Per platform policy, owners cannot delete customer reviews.
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-8">No reviews match the selected filter.</p>
      )}

      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} size="sm" />
                  <span className="font-medium text-sm">{r.user_name || 'Customer'}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                r.rating >= 4 ? 'bg-green-100 text-green-700' :
                r.rating === 3 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {r.rating >= 4 ? 'Positive' : r.rating === 3 ? 'Mixed' : 'Negative'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
