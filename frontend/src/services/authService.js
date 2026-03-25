import api from './api'

export const signup = (data) => api.post('/auth/signup', data)

export const ownerSignup = (data) => api.post('/auth/owner/signup', data)

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', res.data.access_token)
  window.dispatchEvent(new Event('login'))
  return res.data
}

export const ownerLogin = async (email, password) => {
  const res = await api.post('/auth/owner/login', { email, password })
  localStorage.setItem('token', res.data.access_token)
  window.dispatchEvent(new Event('login'))
  return res.data
}

export const logout = () => {
  window._isLoggingOut = true
  localStorage.removeItem('token')
  window.dispatchEvent(new Event('logout'))
  setTimeout(() => { window._isLoggingOut = false }, 100)
}

export const isLoggedIn = () => !!localStorage.getItem('token')
