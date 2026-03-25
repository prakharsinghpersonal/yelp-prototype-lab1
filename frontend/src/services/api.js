import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    })
    
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // Only do hard redirect if not already logging out (to prevent conflict with React Router)
      if (!window._isLoggingOut) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
