import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'))

  useEffect(() => {
    // Check initial auth state
    setIsLoggedIn(!!localStorage.getItem('token'))

    // Listen for storage changes
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'))
    }

    // Listen for custom logout event
    const handleLogout = () => {
      setIsLoggedIn(false)
    }

    // Listen for custom login event
    const handleLogin = () => {
      setIsLoggedIn(true)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('logout', handleLogout)
    window.addEventListener('login', handleLogin)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logout', handleLogout)
      window.removeEventListener('login', handleLogin)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
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
