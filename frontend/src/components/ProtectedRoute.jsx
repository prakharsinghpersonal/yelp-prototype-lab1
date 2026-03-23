/**
 * Protected route guard component
 * Prevents unauthenticated users from accessing protected pages
 */
import { Navigate, Outlet } from 'react-router-dom'
import { isLoggedIn } from '../services/authService'

export default function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />
}
