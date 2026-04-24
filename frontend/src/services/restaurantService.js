import api from './api'

export const getRestaurants = (params, signal) => api.get('/restaurants', { 
  params,
  signal  // Pass abort signal to cancel request if needed
})

export const getRestaurant = (id) => api.get(`/restaurants/${id}`)

export const createRestaurant = (data) => api.post('/restaurants', data)

export const updateRestaurant = (restaurantId, data) =>
  api.put(`/restaurants/${restaurantId}`, data)

export const deleteRestaurant = (restaurantId) =>
  api.delete(`/restaurants/${restaurantId}`)

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

export const getFavorites = () => api.get('/favorites')

export const uploadRestaurantPhoto = (restaurantId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/restaurants/${restaurantId}/photos`, formData)
}

export const uploadReviewPhoto = (reviewId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/reviews/${reviewId}/photos`, formData)
}

export const claimRestaurant = (restaurantId) =>
  api.post(`/restaurants/${restaurantId}/claim`)

export const getOwnerDashboard = () => api.get('/restaurants/owner/dashboard')
