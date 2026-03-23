import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { ownerLogin } from '../services/authService'

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await ownerLogin(email, password)
      // On success, redirect to owner dashboard
      navigate('/owner/dashboard')
      // force reload to update navbar state
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid owner credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 border-b pb-4 drop-shadow-sm">
            Owner Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your restaurant(s)
          </p>
        </div>
        
        {message && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">{message}</div>}
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="email" required placeholder="Business Email address"
              className="input"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password" required placeholder="Password"
              className="input"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg font-bold bg-[#d62828] hover:bg-[#b02020]">
            {loading ? 'Signing in...' : 'Sign In as Owner'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an owner account?{' '}
            <Link to="/owner/signup" className="font-medium text-yelp-red hover:text-red-700 hover:underline">
              Partner with Yelp
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Are you a diner? <Link to="/login" className="underline">Regular login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
