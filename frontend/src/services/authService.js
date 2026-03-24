import api from './api'

export const signup = (data) => api.post('/auth/signup', data)

export const ownerSignup = (data) => api.post('/auth/owner/signup', data)

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', res.data.access_token)
  // Dispatch custom event for login
  window.dispatchEvent(new Event('login'))
  return res.data
}

export const ownerLogin = async (email, password) => {
  const res = await api.post('/auth/owner/login', { email, password })
  localStorage.setItem('token', res.data.access_token)
  // Dispatch custom event for login
  window.dispatchEvent(new Event('login'))
  return res.data
}

export const logout = () => {
  // Set flag to prevent hard redirect in api interceptor
  window._isLoggingOut = true
  localStorage.removeItem('token')
  // Dispatch custom event for logout
  window.dispatchEvent(new Event('logout'))
  // Clear flag after a short delay
  setTimeout(() => {
    window._isLoggingOut = false
  }, 100)
}

export const isLoggedIn = () => !!localStorage.getItem('token')
