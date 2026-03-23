import { Link } from 'react-router-dom'
import StarRating from './StarRating'

// Array of beautiful food/restaurant images for fallbacks
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1504674900769-0ff4ccbf733d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
]

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine_type, city, avg_rating, review_count, price_tier, description } = restaurant
  
  // Use a deterministic image based on restaurant ID
  const imageUrl = FALLBACK_IMAGES[id % FALLBACK_IMAGES.length]

  return (
    <Link to={`/restaurants/${id}`} className="card hover-lift group overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x400?text=Restaurant'
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
