import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRestaurant } from '../services/restaurantService'

import { COUNTRY_CODES, STATES_BY_COUNTRY, COUNTRIES } from '../utils/locations'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean', 'French', 'Other']
const PRICE_TIERS = ['$', '$$', '$$$', '$$$$']

export default function AddRestaurantPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', cuisine_type: '', address: '', city: '', state: '', zip: '', country: '',
    phone: '', description: '', hours: '', price_tier: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setCountry = (e) => setForm((f) => ({ ...f, country: e.target.value, state: '' }))
  const setPhone = (e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
  const setZip = (e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.city || !form.country) { setError('Name, country, and city are required.'); return }
    
    // Validations
    if (form.phone && form.phone.length !== 10) {
      setError('Please enter exactly 10 digits for the phone number.')
      return
    }
    if (form.zip && form.zip.length !== 5) {
      setError('Please enter exactly a 5-digit zip code.')
      return
    }
    if (form.state && form.country && STATES_BY_COUNTRY[form.country] && !STATES_BY_COUNTRY[form.country].includes(form.state)) {
      setError(`Please select a valid state for ${form.country}.`)
      return
    }

    setError('')
    setLoading(true)
    try {
      const fullPhone = form.phone && COUNTRY_CODES[form.country] ? `${COUNTRY_CODES[form.country]} ${form.phone}` : form.phone
      const res = await createRestaurant({
        ...form,
        phone: fullPhone,
        state: form.state ? form.state.toUpperCase() : ''
      })
      navigate(`/restaurants/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create restaurant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Add a Restaurant</h1>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <Field label="Restaurant Name *" id="name" value={form.name} onChange={set('name')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cuisine_type" className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine Type
            </label>
            <select id="cuisine_type" className="input" value={form.cuisine_type} onChange={set('cuisine_type')}>
              <option value="">Select cuisine...</option>
              {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="price_tier" className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <div className="flex gap-2">
              {PRICE_TIERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, price_tier: p }))}
                  className={`px-3 py-2 rounded-md border font-medium transition-colors ${
                    form.price_tier === p
                      ? 'bg-brand-teal text-white border-brand-teal'
                      : 'border-gray-300 hover:border-brand-teal'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Field label="Address" id="address" value={form.address} onChange={set('address')} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select id="country" className="input" value={form.country} onChange={setCountry}>
              <option value="">Select country...</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="City *" id="city" value={form.city} onChange={set('city')} />
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
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input type="text" className="input" value={form.zip} onChange={setZip} maxLength={5} placeholder="5 digits" />
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
        
        <Field label="Hours of Operation" id="hours" value={form.hours} onChange={set('hours')} placeholder="e.g. Mon-Fri 11am-10pm" />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="input"
            value={form.description}
            onChange={set('description')}
            placeholder="Tell people what makes this place special..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Adding...' : 'Add Restaurant'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, id, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={id} type={type} className="input" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}
