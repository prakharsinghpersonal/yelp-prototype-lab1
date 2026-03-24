import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ownerSignup } from '../services/authService'
import { COUNTRY_CODES, STATES_BY_COUNTRY, COUNTRIES } from '../utils/locations'

export default function OwnerSignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', restaurant_name: '', restaurant_location: '',
    country: '', city: '', state: '', zip: '', phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const setPhone = (e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
  const setZip = (e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))
  const setCountry = (e) => setForm((f) => ({ ...f, country: e.target.value, state: '' }))

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.country || !form.city) return 'Name, Email, Password, Country, and City are required.'
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
    setLoading(true)
    setError('')
    try {
      const fullPhone = form.phone && COUNTRY_CODES[form.country] ? `${COUNTRY_CODES[form.country]} ${form.phone}` : form.phone
      await ownerSignup({
        ...form,
        state: form.state ? form.state.toUpperCase() : '',
        zip_code: form.zip,
        phone: fullPhone
      })
      navigate('/owner/login', { state: { message: 'Owner account created successfully! Please log in.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (id, label, type = 'text', autoComplete = '') => (
    <div>
      <input
        id={id}
        type={type}
        className="input"
        placeholder={label}
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        autoComplete={autoComplete}
        required
      />
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 border-b pb-4">
            Partner with Yelp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an owner account to manage your restaurant
          </p>
        </div>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {field('name', 'Full Name *', 'text', 'name')}
            {field('email', 'Business Email Address *', 'email', 'email')}
            {field('password', 'Password *', 'password', 'new-password')}
            
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Owner Contact Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <select className="input" value={form.country} onChange={setCountry} required>
                  <option value="">Select country... *</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text" className="input" placeholder="City *"
                  value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {form.country && STATES_BY_COUNTRY[form.country] ? (
                  <select className="input" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}>
                    <option value="">Select state...</option>
                    {STATES_BY_COUNTRY[form.country].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" className="input" 
                    value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} 
                    placeholder={form.country ? "State / Region" : "Select country first"} disabled={!form.country}
                  />
                )}
                
                <input 
                  type="text" className="input" value={form.zip} onChange={setZip} maxLength={5} placeholder="Zip Code (5 digits)" 
                />
              </div>

              <div className="flex mb-4">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                  {form.country ? COUNTRY_CODES[form.country] || '+' : '+?'}
                </span>
                <input 
                  type="tel" className="input rounded-l-none" 
                  value={form.phone} onChange={setPhone} maxLength={10} 
                  disabled={!form.country} placeholder={form.country ? "Phone (10 digits)" : "Select country first"}
                />
              </div>
            </div>

            <hr />
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Restaurant Details</p>
            <input
              type="text" placeholder="Restaurant Name (Optional)"
              className="input"
              value={form.restaurant_name} onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
            />
            <input
              type="text" placeholder="Restaurant Location (Optional)"
              className="input"
              value={form.restaurant_location} onChange={(e) => setForm({ ...form, restaurant_location: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg font-bold bg-[#d62828] hover:bg-[#b02020]">
            {loading ? 'Creating account...' : 'Create Owner Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an owner account?{' '}
            <Link to="/owner/login" className="font-medium text-yelp-red hover:text-red-700 hover:underline">
              Log in here
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Looking for regular user signup? <Link to="/signup" className="underline">Click here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
