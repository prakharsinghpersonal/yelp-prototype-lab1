/**
 * Add restaurant page - Create new restaurant listing
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRestaurant } from '../services/restaurantService'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean', 'French', 'Other']
const PRICE_TIERS = ['$', '$$', '$$$', '$$$$']

export default function AddRestaurantPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', cuisine_type: '', address: '', city: '', zip: '',
    phone: '', description: '', hours: '', price_tier: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.city) { setError('Name and city are required.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await createRestaurant(form)
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
                className={`px-4 py-2 rounded-md border font-medium transition-colors ${
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

        <Field label="Address" id="address" value={form.address} onChange={set('address')} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City *" id="city" value={form.city} onChange={set('city')} />
          <Field label="Zip Code" id="zip" value={form.zip} onChange={set('zip')} />
        </div>
        <Field label="Phone" id="phone" value={form.phone} onChange={set('phone')} type="tel" />
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
