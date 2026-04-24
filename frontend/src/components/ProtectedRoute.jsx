import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ allowedRoles = null, redirectTo = '/login' }) {
  const { isLoggedIn, authReady, role } = useAuth()

  if (!authReady) {
    return <div className="py-20 text-center text-gray-500">Loading...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'owner' ? '/owner/dashboard' : '/'} replace />
  }

  return <Outlet />
}
