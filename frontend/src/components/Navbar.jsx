import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-2xl font-bold text-[#e1515f]">★</div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-[#e1515f] transition-colors">Yelpish</span>
        </Link>

        {/* Center - Navigation Links */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="text-gray-700 hover:text-[#e1515f] transition-colors">
              Explore
            </Link>
            <Link to="/favorites" className="text-gray-700 hover:text-[#e1515f] transition-colors">
              Favorites
            </Link>
            <Link to="/chat" className="text-gray-700 hover:text-[#e1515f] transition-colors">
              Ask AI
            </Link>
          </div>
        )}

        {/* Right side - Auth/User Menu */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link 
                to="/add-restaurant" 
                className="hidden sm:inline-block btn-secondary text-sm py-2"
              >
                Add Restaurant
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-700 hover:text-[#e1515f] transition-colors font-medium"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn-primary text-sm py-2"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-[#e1515f] transition-colors font-medium">
                Log In
              </Link>
              <Link to="/signup" className="btn-primary text-sm py-2">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
