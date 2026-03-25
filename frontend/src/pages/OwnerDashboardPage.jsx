import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerDashboard } from '../services/restaurantService'
import StarRating from '../components/StarRating'

export default function OwnerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await getOwnerDashboard()
        setDashboardData(res.data)
      } catch (err) {
        setError('Failed to load owner dashboard. Ensure you are logged in as an owner.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yelp-red"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    )
  }

  const { total_restaurants, total_views, total_reviews, average_rating, ratings_distribution, restaurants } = dashboardData

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Owner Dashboard</h1>
        <Link to="/add-restaurant" className="btn-primary">
          + Add New Restaurant
        </Link>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Restaurants</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{total_restaurants}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Views (Last 30 days)</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{total_views}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{total_reviews}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 flex items-center gap-2">
            {average_rating} <StarRating rating={average_rating} size="sm" />
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Restaurants List */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Your Restaurants</h2>
          {restaurants && restaurants.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {restaurants.map(rest => (
                <div key={rest.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      <Link to={`/restaurants/${rest.id}`} className="hover:text-yelp-red">{rest.name}</Link>
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <StarRating rating={rest.rating} size="sm" />
                      <span>({rest.reviews} reviews)</span>
                    </div>
                  </div>
                  <Link to={`/restaurants/${rest.id}`} className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't added or claimed any restaurants yet.</p>
              <p className="mt-2 text-sm text-gray-400">Head to the Explore page to claim your business or add a new one.</p>
            </div>
          )}
        </div>

        {/* Ratings Distribution Widget */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Sentiment Analytics</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">5 <StarRating rating={1} size="sm" /></span>
              <div className="flex-1 mx-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${ratings_distribution?.['5_star'] || 0}%` }}></div>
              </div>
              <span className="text-gray-900 font-medium">{ratings_distribution?.['5_star'] || 0}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">4 <StarRating rating={1} size="sm" /></span>
              <div className="flex-1 mx-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full" style={{ width: `${ratings_distribution?.['4_star'] || 0}%` }}></div>
              </div>
              <span className="text-gray-900 font-medium">{ratings_distribution?.['4_star'] || 0}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">3 <StarRating rating={1} size="sm" /></span>
              <div className="flex-1 mx-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full" style={{ width: `${ratings_distribution?.['3_star'] || 0}%` }}></div>
              </div>
              <span className="text-gray-900 font-medium">{ratings_distribution?.['3_star'] || 0}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">2 <StarRating rating={1} size="sm" /></span>
              <div className="flex-1 mx-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full" style={{ width: `${ratings_distribution?.['2_star'] || 0}%` }}></div>
              </div>
              <span className="text-gray-900 font-medium">{ratings_distribution?.['2_star'] || 0}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">1 <StarRating rating={1} size="sm" /></span>
              <div className="flex-1 mx-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full" style={{ width: `${ratings_distribution?.['1_star'] || 0}%` }}></div>
              </div>
              <span className="text-gray-900 font-medium">{ratings_distribution?.['1_star'] || 0}%</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t text-center">
            <span className="text-sm text-gray-500">Overall Sentiment:</span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {dashboardData.overall_sentiment || 'Positive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
