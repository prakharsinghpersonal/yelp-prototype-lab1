/**
 * Restaurant service - Search, details, reviews, and favorites API calls
 */
import api from './api'

export const getRestaurants = (params) => api.get('/restaurants', { params })

export const getRestaurant = (id) => api.get(`/restaurants/${id}`)

export const createRestaurant = (data) => api.post('/restaurants', data)

export const getReviews = (restaurantId) =>
  api.get(`/restaurants/${restaurantId}/reviews`)

export const createReview = (restaurantId, data) =>
  api.post(`/restaurants/${restaurantId}/reviews`, data)

export const updateReview = (reviewId, data) => api.put(`/reviews/${reviewId}`, data)

export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`)

export const addFavorite = (restaurantId) =>
  api.post(`/favorites/${restaurantId}`)

export const removeFavorite = (restaurantId) =>
  api.delete(`/favorites/${restaurantId}`)

export const getFavorites = (params) => api.get('/favorites', { params })

export const uploadRestaurantPhoto = (restaurantId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/restaurants/${restaurantId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const claimRestaurant = (restaurantId) =>
  api.post(`/restaurants/${restaurantId}/claim`)

export const getOwnerDashboard = () => api.get('/restaurants/owner/dashboard')
