import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'

export default function OwnerLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/owner/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-dark">Owner Login</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your restaurant listings</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" type="email" className="input" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" type="password" className="input" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoComplete="current-password" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6 space-y-1">
          <p>Don't have an owner account?{' '}
            <Link to="/owner/signup" className="text-[#f77f00] font-semibold hover:underline">Register here</Link>
          </p>
          <p>Not an owner?{' '}
            <Link to="/login" className="text-[#f77f00] font-semibold hover:underline">User login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
