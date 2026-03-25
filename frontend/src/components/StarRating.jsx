// Display-only star rating
export default function StarRating({ rating, max = 5, size = 'md' }) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }
  return (
    <span className={`${sizes[size]} inline-flex gap-0.5`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-yelp-red' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}
