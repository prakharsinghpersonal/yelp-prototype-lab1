/**
 * Authentication service - Login, signup, and token management
 */
import api from './api'

export const signup = (data) => api.post('/auth/signup', data)

export const login = async (email, password) => {
  // FastAPI's OAuth2 built-in completely rejects JSON. It ONLY accepts "Form Data".
  // We use URLSearchParams to package the data exactly how Swagger UI does!
  const formData = new URLSearchParams()
  formData.append('username', email) // OAuth2 standard requires the field to be named 'username'
  formData.append('password', password)

  const res = await api.post('/auth/login', formData)
  localStorage.setItem('token', res.data.access_token)
  return res.data
}

export const logout = () => {
  localStorage.removeItem('token')
}

export const isLoggedIn = () => !!localStorage.getItem('token')
