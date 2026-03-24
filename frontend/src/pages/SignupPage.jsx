import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, login } from '../services/authService'
import { COUNTRY_CODES, STATES_BY_COUNTRY, COUNTRIES } from '../utils/locations'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', confirm: '',
    country: '', city: '', state: '', zip: '', phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setPhone = (e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
  const setZip = (e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))
  const setCountry = (e) => setForm((f) => ({ ...f, country: e.target.value, state: '' }))

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.country || !form.city) return 'Name, Email, Password, Country, and City are required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    if (form.phone && form.phone.length !== 10) return 'Phone number must be exactly 10 digits.'
    if (form.zip && form.zip.length !== 5) return 'Zip code must be exactly 5 digits.'
    if (form.state && form.country && STATES_BY_COUNTRY[form.country] && !STATES_BY_COUNTRY[form.country].includes(form.state)) {
      return `Please select a valid state for ${form.country}.`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      const fullPhone = form.phone && COUNTRY_CODES[form.country] ? `${COUNTRY_CODES[form.country]} ${form.phone}` : form.phone
      await signup({ 
        name: form.name, 
        email: form.email, 
        password: form.password,
        country: form.country,
        city: form.city,
        state: form.state ? form.state.toUpperCase() : '',
        zip_code: form.zip,
        phone: fullPhone
      })
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="card w-full max-w-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Join <span className="text-brand-teal">yelp★</span>
        </h1>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {field('name', 'Full Name *', 'text', 'name')}
          {field('email', 'Email *', 'email', 'email')}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('password', 'Password *', 'password', 'new-password')}
            {field('confirm', 'Confirm Password *', 'password', 'new-password')}
          </div>

          <div className="border-t pt-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Location & Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select className="input" value={form.country} onChange={setCountry} required>
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {field('city', 'City *', 'text', 'address-level2')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {form.country && STATES_BY_COUNTRY[form.country] ? (
                  <select className="input" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}>
                    <option value="">Select state...</option>
                    {STATES_BY_COUNTRY[form.country].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="input" 
                    value={form.state} 
                    onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} 
                    placeholder={form.country ? "Enter state/region" : "Select country first"}
                    disabled={!form.country}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input type="text" className="input" value={form.zip} onChange={setZip} maxLength={5} placeholder="5 digits" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                  {form.country ? COUNTRY_CODES[form.country] || '+' : '+?'}
                </span>
                <input 
                  type="tel" 
                  className="input rounded-l-none" 
                  value={form.phone} 
                  onChange={setPhone} 
                  maxLength={10} 
                  disabled={!form.country}
                  placeholder={form.country ? "10 digits" : "Select country first"}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
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
