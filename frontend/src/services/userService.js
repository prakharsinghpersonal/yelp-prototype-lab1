import api from './api'

export const getProfile = () => api.get('/users/me')

export const updateProfile = (data) => api.put('/users/me', data)

export const uploadProfilePhoto = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getPreferences = () => api.get('/users/me/preferences')

export const updatePreferences = (data) => api.put('/users/me/preferences', data)

export const getHistory = () => api.get('/users/me/history')
