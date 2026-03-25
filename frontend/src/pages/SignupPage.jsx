import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, login } from '../services/authService'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!form.name || !form.email || !form.password) return 'All fields are required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      await signup({ name: form.name, email: form.email, password: form.password })
      await login(form.email, form.password)
      // Small delay to ensure token and events are processed
      await new Promise(resolve => setTimeout(resolve, 100))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const field = (id, label, type = 'text', autoComplete = '') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="input"
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        autoComplete={autoComplete}
        required
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Join <span className="text-brand-teal">yelp★</span>
        </h1>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {field('name', 'Full Name', 'text', 'name')}
          {field('email', 'Email', 'email', 'email')}
          {field('password', 'Password', 'password', 'new-password')}
          {field('confirm', 'Confirm Password', 'password', 'new-password')}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-teal font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
