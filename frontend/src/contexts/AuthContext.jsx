import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { getProfile } from '../services/userService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  const syncAuth = useCallback(async () => {
    const hasToken = !!localStorage.getItem('token')
    setIsLoggedIn(hasToken)
    if (!hasToken) {
      setUser(null)
      setAuthReady(true)
      return null
    }
    try {
      const res = await getProfile()
      setUser(res.data)
      return res.data
    } catch {
      localStorage.removeItem('token')
      setIsLoggedIn(false)
      setUser(null)
      return null
    } finally {
      setAuthReady(true)
    }
  }, [])

  useEffect(() => {
    syncAuth()

    const handleStorageChange = () => {
      syncAuth()
    }

    const handleLogout = () => {
      setIsLoggedIn(false)
      setUser(null)
      setAuthReady(true)
    }

    const handleLogin = () => {
      syncAuth()
    }

    const handleProfileRefresh = () => {
      syncAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('logout', handleLogout)
    window.addEventListener('login', handleLogin)
    window.addEventListener('profile-updated', handleProfileRefresh)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logout', handleLogout)
      window.removeEventListener('login', handleLogin)
      window.removeEventListener('profile-updated', handleProfileRefresh)
    }
  }, [syncAuth])

  const value = useMemo(() => ({
    isLoggedIn,
    user,
    role: user?.role || null,
    authReady,
    isOwner: user?.role === 'owner',
    isCustomer: user?.role === 'user',
    refreshAuth: syncAuth,
  }), [isLoggedIn, user, authReady, syncAuth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
