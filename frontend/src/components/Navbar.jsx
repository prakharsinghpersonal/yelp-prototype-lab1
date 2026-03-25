import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, logout } from '../services/authService'
import useDarkMode from '../hooks/useDarkMode'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const [dark, setDark] = useDarkMode()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#003049] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight shrink-0">
          yelp<span className="text-[#fcbf49]">★</span>
        </Link>

        <Link to="/" className="hidden md:block text-sm text-blue-200 hover:text-white transition-colors">
          Find Restaurants
        </Link>

        <div className="flex items-center gap-3 text-sm font-medium">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            className="text-lg hover:text-[#fcbf49] transition-colors"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {loggedIn ? (
            <>
              <Link to="/chat" className="hover:text-[#fcbf49] transition-colors">AI Chat</Link>
              <Link to="/favorites" className="hover:text-[#fcbf49] transition-colors">Favorites</Link>
              <Link to="/history" className="hover:text-[#fcbf49] transition-colors hidden sm:block">History</Link>
              <Link to="/add-restaurant" className="hover:text-[#fcbf49] transition-colors hidden sm:block">Add Restaurant</Link>
              <Link to="/owner/dashboard" className="hover:text-[#fcbf49] transition-colors hidden sm:block">Owner</Link>
              <Link to="/profile" className="hover:text-[#fcbf49] transition-colors">Profile</Link>
              <button
                onClick={handleLogout}
                className="bg-[#d62828] text-white px-3 py-1 rounded-md hover:bg-red-800 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/owner/login" className="hover:text-[#fcbf49] transition-colors text-xs opacity-80">
                Owner Portal
              </Link>
              <Link to="/login" className="hover:text-[#fcbf49] transition-colors">Log In</Link>
              <Link to="/signup" className="bg-[#d62828] text-white px-3 py-1 rounded-md hover:bg-red-800 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
