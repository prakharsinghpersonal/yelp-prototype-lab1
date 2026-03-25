import { Link } from 'react-router-dom'
import StarRating from './StarRating'

// Array of beautiful food/restaurant images for fallbacks
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80',
]

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine_type, city, avg_rating, review_count, price_tier, description, image_url } = restaurant
  
  // Use a deterministic image based on restaurant ID
  const displayImage = image_url || FALLBACK_IMAGES[id % FALLBACK_IMAGES.length]

  return (
    <Link to={`/restaurants/${id}`} className="card hover-lift group overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {/* Fallback text (Behind image) */}
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white text-lg font-bold bg-gradient-to-br from-[#e1515f] to-[#d62828]">
          {name}
        </div>
        
        <img 
          src={displayImage} 
          alt={name} 
          className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
        
        {/* Price Tier Badge - Top Right */}
        {price_tier && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md font-semibold text-gray-900 text-sm">
            {price_tier}
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Restaurant Name */}
        <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-[#e1515f] transition-colors">
          {name}
        </h3>

        {/* Rating Section */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            <StarRating rating={avg_rating || 0} size="sm" />
          </div>
          <span className="text-sm font-medium text-gray-800">
            {avg_rating ? avg_rating.toFixed(1) : '—'}
          </span>
          {review_count && review_count > 0 && (
            <span className="text-xs text-gray-500">
              ({review_count} {review_count === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>

        {/* Cuisine & Location */}
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1 truncate">
            <span>{cuisine_type}</span>
            {city && <span className="text-gray-400">·</span>}
            {city && <span className="truncate">{city}</span>}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 h-10">
            {description}
          </p>
        )}

        {/* View Details Link */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-[#e1515f] text-sm font-medium hover:text-red-700 transition-colors">
          View Details →
        </div>
      </div>
    </Link>
  )
}
