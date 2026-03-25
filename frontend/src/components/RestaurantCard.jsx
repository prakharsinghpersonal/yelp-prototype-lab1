/**
 * Reusable restaurant card component
 * Displays restaurant info with image, rating, and quick actions
 */
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine_type, city, avg_rating, review_count, price_tier, description } =
    restaurant

  return (
    <Link to={`/restaurants/${id}`} className="card hover:shadow-md transition-shadow block">
      {/* Placeholder image */}
      <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-400 text-4xl">
        🍽️
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 truncate">{name}</h3>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={avg_rating || 0} size="sm" />
          <span className="text-sm text-gray-500">
            {avg_rating ? avg_rating.toFixed(1) : 'No ratings'}{' '}
            {review_count ? `(${review_count})` : ''}
          </span>
          {price_tier && (
            <span className="text-sm text-gray-500 ml-auto">{price_tier}</span>
          )}
        </div>

        <div className="mt-1 text-sm text-gray-500 flex gap-2">
          {cuisine_type && <span>{cuisine_type}</span>}
          {city && <span>· {city}</span>}
        </div>

        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  )
}
