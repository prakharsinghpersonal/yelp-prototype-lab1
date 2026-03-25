import api from './api'

export const signup = (data) => api.post('/auth/signup', data)

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', res.data.access_token)
  return res.data
}

export const logout = () => {
  localStorage.removeItem('token')
}

export const isLoggedIn = () => !!localStorage.getItem('token')
