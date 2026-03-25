/**
 * Authentication service - Login, signup, and token management
 */
import api from './api'

export const signup = (data) => api.post('/auth/signup', data)

export const ownerSignup = (data) => api.post('/auth/owner/signup', data)

export const login = async (email, password) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const res = await api.post('/auth/login', formData)
  localStorage.setItem('token', res.data.access_token)
  return res.data
}

export const ownerLogin = async (email, password) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const res = await api.post('/auth/owner/login', formData)
  localStorage.setItem('token', res.data.access_token)
  return res.data
}

export const logout = () => {
  localStorage.removeItem('token')
}

export const isLoggedIn = () => !!localStorage.getItem('token')
