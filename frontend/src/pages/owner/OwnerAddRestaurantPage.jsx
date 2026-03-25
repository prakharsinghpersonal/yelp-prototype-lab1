import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRestaurant } from '../../services/restaurantService'
import api from '../../services/api'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean', 'French', 'Other']
const PRICE_TIERS = ['$', '$$', '$$$', '$$$$']
const AMENITIES = ['WiFi', 'Outdoor Seating', 'Parking', 'Wheelchair Accessible', 'Family Friendly', 'Takeout', 'Delivery', 'Reservations']

export default function OwnerAddRestaurantPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', cuisine_type: '', address: '', city: '', zip: '',
    phone: '', description: '', hours: '', price_tier: '', amenities: [],
  })
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.city) { setError('Name and city are required.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await createRestaurant(form)
      const restaurantId = res.data.id
      // Upload photos
      for (const file of photos) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/restaurants/${restaurantId}/photos`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }).catch(() => {})
      }
      navigate(`/restaurants/${restaurantId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create restaurant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#003049] dark:text-white mb-2">Post Your Restaurant</h1>
      <p className="text-sm text-gray-500 mb-6">Add your restaurant listing to the platform.</p>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <Field label="Restaurant Name *" value={form.name} onChange={set('name')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuisine Type</label>
            <select className="input" value={form.cuisine_type} onChange={set('cuisine_type')}>
              <option value="">Select...</option>
              {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
            <div className="flex gap-1">
              {PRICE_TIERS.map((p) => (
                <button key={p} type="button"
                  onClick={() => setForm((f) => ({ ...f, price_tier: p }))}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                    form.price_tier === p ? 'bg-[#d62828] text-white border-[#d62828]' : 'border-gray-300 hover:border-[#d62828]'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <Field label="Description" value={form.description} onChange={set('description')} textarea
          placeholder="Tell people what makes your restaurant special..." />
        <Field label="Address" value={form.address} onChange={set('address')} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City *" value={form.city} onChange={set('city')} />
          <Field label="Zip Code" value={form.zip} onChange={set('zip')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" value={form.phone} onChange={set('phone')} type="tel" />
          <Field label="Hours" value={form.hours} onChange={set('hours')} placeholder="e.g. Mon–Fri 11am–10pm" />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  form.amenities.includes(a)
                    ? 'bg-[#f77f00] text-white border-[#f77f00]'
                    : 'border-gray-300 hover:border-[#f77f00]'
                }`}>{a}</button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Restaurant Photos <span className="text-gray-400">(optional)</span>
          </label>
          <label className="btn-secondary text-sm cursor-pointer inline-block">
            📷 {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Add Photos'}
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => setPhotos(Array.from(e.target.files))} />
          </label>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((f, i) => (
                <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-[120px]">
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Publishing...' : 'Publish Restaurant'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {textarea
        ? <textarea rows={3} className="input" value={value} onChange={onChange} placeholder={placeholder} />
        : <input type={type} className="input" value={value} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  )
}
