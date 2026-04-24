import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login, ownerLogin } from '../services/authService'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const { refreshAuth } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'user'
  const [role, setRole] = useState(initialRole)

  const setRoleSelection = (nextRole) => {
    setRole(nextRole)
    const nextParams = new URLSearchParams(searchParams)
    if (nextRole === 'owner') {
      nextParams.set('role', 'owner')
    } else {
      nextParams.delete('role')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      if (role === 'owner') {
        await ownerLogin(form.email, form.password)
        await refreshAuth()
        showToast('Owner login successful.')
        navigate('/owner/dashboard')
      } else {
        await login(form.email, form.password)
        await refreshAuth()
        showToast('Customer login successful.')
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Log in to <span className="text-brand-teal">yelp★</span>
        </h1>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRoleSelection('user')}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              role === 'user' ? 'border-[#e1515f] bg-red-50 text-[#e1515f]' : 'border-gray-200'
            }`}
          >
            <p className="font-semibold">Customer</p>
            <p className="text-xs text-gray-500 mt-1">Favorites, reviews, AI</p>
          </button>
          <button
            type="button"
            onClick={() => setRoleSelection('owner')}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              role === 'owner' ? 'border-[#e1515f] bg-red-50 text-[#e1515f]' : 'border-gray-200'
            }`}
          >
            <p className="font-semibold">Owner</p>
            <p className="text-xs text-gray-500 mt-1">Restaurants and reviews</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Logging in...' : `Log In as ${role === 'owner' ? 'Owner' : 'Customer'}`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to={role === 'owner' ? '/signup?role=owner' : '/signup'} className="text-brand-teal font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
