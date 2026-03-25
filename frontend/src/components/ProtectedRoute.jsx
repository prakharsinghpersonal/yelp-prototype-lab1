import { Navigate, Outlet } from 'react-router-dom'
import { isLoggedIn } from '../services/authService'

export default function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />
}
