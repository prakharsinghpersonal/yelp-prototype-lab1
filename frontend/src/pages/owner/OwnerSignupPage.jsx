import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, login } from '../../services/authService'

export default function OwnerSignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', restaurant_location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.restaurant_location)
      return 'All fields are required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        restaurant_location: form.restaurant_location,
        role: 'owner',
      })
      await login(form.email, form.password)
      navigate('/owner/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#003049]">Register as Owner</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your restaurant on yelp★</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {[
            { id: 'name', label: 'Full Name', type: 'text', auto: 'name' },
            { id: 'email', label: 'Email', type: 'email', auto: 'email' },
            { id: 'restaurant_location', label: 'Restaurant Location', type: 'text', auto: 'off' },
            { id: 'password', label: 'Password', type: 'password', auto: 'new-password' },
            { id: 'confirm', label: 'Confirm Password', type: 'password', auto: 'new-password' },
          ].map(({ id, label, type, auto }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input id={id} type={type} className="input" value={form[id]} onChange={set(id)} autoComplete={auto} required />
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account...' : 'Create Owner Account'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6 space-y-1">
          <p>Already have an owner account?{' '}
            <Link to="/owner/login" className="text-[#f77f00] font-semibold hover:underline">Log in</Link>
          </p>
          <p>Not an owner?{' '}
            <Link to="/signup" className="text-[#f77f00] font-semibold hover:underline">Sign up as user</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
