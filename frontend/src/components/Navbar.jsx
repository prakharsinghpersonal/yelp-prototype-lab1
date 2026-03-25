/**
 * Navigation bar component
 * Displayed on all pages with links and logout button
 */
import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, logout } from '../services/authService'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#003049] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight">
          yelp<span className="text-[#fcbf49]">★</span>
        </Link>

        {/* Search hint */}
        <Link
          to="/"
          className="hidden md:block text-sm text-blue-200 hover:text-white transition-colors"
        >
          Find Restaurants
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {loggedIn ? (
            <>
              <Link to="/favorites" className="hover:text-[#fcbf49] transition-colors">
                Favorites
              </Link>
              <Link to="/history" className="hover:text-[#fcbf49] transition-colors">
                History
              </Link>
              <Link to="/add-restaurant" className="hover:text-[#fcbf49] transition-colors">
                Add Restaurant
              </Link>
              <Link to="/profile" className="hover:text-[#fcbf49] transition-colors">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#d62828] text-white px-3 py-1 rounded-md hover:bg-red-800 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-[#fcbf49] transition-colors">
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-[#d62828] text-white px-3 py-1 rounded-md hover:bg-red-800 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
