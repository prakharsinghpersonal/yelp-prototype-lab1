import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      const serverErr = err.response?.data?.detail;
      setError(serverErr ? (typeof serverErr === 'string' ? serverErr : JSON.stringify(serverErr)) : err.message || 'Network error or unable to log in.');
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-teal font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
