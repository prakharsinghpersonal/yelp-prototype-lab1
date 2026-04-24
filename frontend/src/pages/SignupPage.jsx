import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ownerSignup, signup, applyAuthToken } from '../services/authService'
import { COUNTRY_CODES, STATES_BY_COUNTRY, COUNTRIES, normalizeCountry } from '../utils/locations'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const { refreshAuth } = useAuth()
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'user'
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', confirm: '',
    country: '', city: '', state: '', zip: '', phone: '', role: initialRole,
    restaurant_name: '', restaurant_location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setPhone = (e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
  const setZip = (e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))
  const setCountry = (e) => setForm((f) => ({ ...f, country: e.target.value, state: '' }))
  const setRoleSelection = (role) => {
    setForm((current) => ({ ...current, role }))
    const nextParams = new URLSearchParams(searchParams)
    if (role === 'owner') {
      nextParams.set('role', 'owner')
    } else {
      nextParams.delete('role')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.country || !form.city) return 'Name, Email, Password, Country, and City are required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    if (form.role === 'owner' && !form.restaurant_location) return 'Restaurant location is required for owner signup.'
    if (form.phone && form.phone.length !== 10) return 'Phone number must be exactly 10 digits.'
    if (form.zip && form.zip.length !== 5) return 'Zip code must be exactly 5 digits.'
    if (form.state && form.country && STATES_BY_COUNTRY[form.country] && !STATES_BY_COUNTRY[form.country].includes(form.state)) {
      return `Please select a valid state for ${form.country}.`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      const country = normalizeCountry(form.country)
      const fullPhone = form.phone && COUNTRY_CODES[country] ? `${COUNTRY_CODES[country]} ${form.phone}` : form.phone
      const payload = { 
        name: form.name, 
        email: form.email, 
        password: form.password,
        country,
        city: form.city,
        state: form.state ? form.state.toUpperCase() : '',
        zip_code: form.zip,
        phone: fullPhone,
        role: form.role,
        restaurant_name: form.role === 'owner' ? form.restaurant_name : undefined,
        restaurant_location: form.role === 'owner' ? form.restaurant_location : undefined,
      }
      const res = form.role === 'owner' ? await ownerSignup(payload) : await signup(payload)
      applyAuthToken(res.data.access_token)
      await refreshAuth()
      showToast(`${form.role === 'owner' ? 'Owner' : 'Customer'} account created successfully.`)
      navigate(form.role === 'owner' ? '/owner/dashboard' : '/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const field = (id, label, type = 'text', autoComplete = '', required = true) => (
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
        required={required}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Create account as</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'user', label: 'Customer', sub: 'Find, favorite, review' },
                { value: 'owner', label: 'Owner', sub: 'Manage restaurants' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRoleSelection(option.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    form.role === option.value
                      ? 'border-[#e1515f] bg-red-50 text-[#e1515f]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#e1515f]'
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.sub}</p>
                </button>
              ))}
            </div>
          </div>
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
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select id="country" className="input" value={form.country} onChange={setCountry} required>
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {field('city', 'City *', 'text', 'address-level2')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {form.country && STATES_BY_COUNTRY[form.country] ? (
                  <select id="state" className="input" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}>
                    <option value="">Select state...</option>
                    {STATES_BY_COUNTRY[form.country].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input 
                    id="state"
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
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input id="zip" type="text" className="input" value={form.zip} onChange={setZip} maxLength={5} placeholder="5 digits" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                  {form.country ? COUNTRY_CODES[form.country] || '+' : '+?'}
                </span>
                <input 
                  id="phone"
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

          {form.role === 'owner' && (
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Restaurant Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('restaurant_name', 'Restaurant Name', 'text', '', false)}
                {field('restaurant_location', 'Restaurant Location *', 'text')}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to={form.role === 'owner' ? '/login?role=owner' : '/login'} className="text-brand-teal font-semibold hover:underline">
            {form.role === 'owner' ? 'Owner login' : 'Customer login'}
          </Link>
        </p>
      </div>
    </div>
  )
}
