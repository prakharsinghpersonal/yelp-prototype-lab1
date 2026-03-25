import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine_type, city, avg_rating, review_count, price_tier, description } =
    restaurant

  return (
    <Link to={`/restaurants/${id}`} className="card hover:shadow-md transition-shadow block">
      {/* Placeholder image */}
      <div className="bg-gray-100 h-40 flex items-center justify-center text-4xl">
        🍽️
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-brand-dark truncate">{name}</h3>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={avg_rating || 0} size="sm" />
          <span className="text-sm text-gray-500">
            {avg_rating ? avg_rating.toFixed(1) : 'No ratings'}{' '}
            {review_count ? `(${review_count})` : ''}
          </span>
          {price_tier && (
            <span className="text-sm text-[#f77f00] ml-auto font-medium">{price_tier}</span>
          )}
        </div>

        {/* Cuisine pill — uses palette orange, stays consistent in both modes */}
        <div className="mt-2 flex flex-wrap gap-1 items-center">
          {cuisine_type && (
            <span className="bg-[#f77f00]/15 text-[#f77f00] text-xs px-2 py-0.5 rounded-full font-medium">
              {cuisine_type}
            </span>
          )}
          {city && (
            <span className="text-xs text-gray-500 ml-1">· {city}</span>
          )}
        </div>

        {description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  )
}
