import { useState } from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const imgSrc = (url) => (url && url.startsWith('/uploads') ? `${API}${url}` : url)

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine_type, city, avg_rating, review_count, price_tier, description, image_url } =
    restaurant
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <Link to={`/restaurants/${id}`} className="card hover:shadow-md transition-shadow block">
      {/* Image area */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {image_url && !imgError ? (
          <>
            {/* Blurred placeholder shown until image loads */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={imgSrc(image_url)}
              alt={name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {/* Price badge */}
        {price_tier && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {price_tier}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-brand-dark truncate">{name}</h3>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={avg_rating || 0} size="sm" />
          <span className="text-sm text-gray-500">
            {avg_rating ? avg_rating.toFixed(1) : 'No ratings'}{' '}
            {review_count ? `(${review_count})` : ''}
          </span>
        </div>

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
