import { useState, useEffect } from 'react'
import api from '../../services/api'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean', 'French', 'Other']
const PRICE_TIERS = ['$', '$$', '$$$', '$$$$']
const AMENITIES = ['WiFi', 'Outdoor Seating', 'Parking', 'Wheelchair Accessible', 'Family Friendly', 'Takeout', 'Delivery', 'Reservations']

export default function OwnerRestaurantPage() {
  const [allRestaurants, setAllRestaurants] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Load all owned restaurants list first
  useEffect(() => {
    api.get('/restaurants/owner/dashboard')
      .then((res) => {
        const list = res.data.all_restaurants || []
        setAllRestaurants(list)
        const primaryId = res.data.restaurant?.id
        if (primaryId) {
          setSelectedId(primaryId)
        }
      })
      .catch(() => setError('Failed to load restaurants.'))
      .finally(() => setLoading(false))
  }, [])

  // Load full details for selected restaurant
  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    api.get(`/restaurants/${selectedId}`)
      .then((res) => setForm(res.data))
      .catch(() => setError('Failed to load restaurant profile.'))
      .finally(() => setLoading(false))
  }, [selectedId])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleAmenity = (a) =>
    setForm((f) => {
      const list = f.amenities || []
      return { ...f, amenities: list.includes(a) ? list.filter((x) => x !== a) : [...list, a] }
    })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMessage(''); setError('')
    try {
      await api.put(`/restaurants/${form.id}`, form)
      setMessage('Restaurant profile updated.')
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post(`/restaurants/${form.id}/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage('Photo uploaded.')
    } catch {
      setError('Photo upload failed.')
    }
  }

  if (loading && !form) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error && !form) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!form) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-2">Manage Restaurant Profile</h1>

      {/* Restaurant picker — shown when owner has multiple */}
      {allRestaurants.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">Managing:</label>
          <select
            className="input w-full max-w-sm"
            value={selectedId || ''}
            onChange={(e) => { setSelectedId(Number(e.target.value)); setMessage(''); setError('') }}
          >
            {allRestaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        {/* Basic info */}
        <Field label="Restaurant Name *" value={form.name || ''} onChange={set('name')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
            <select className="input" value={form.cuisine_type || ''} onChange={set('cuisine_type')}>
              <option value="">Select...</option>
              {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <div className="flex gap-2">
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

        <Field label="Description" value={form.description || ''} onChange={set('description')} textarea />
        <Field label="Address" value={form.address || ''} onChange={set('address')} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" value={form.city || ''} onChange={set('city')} />
          <Field label="Zip Code" value={form.zip || ''} onChange={set('zip')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" value={form.phone || ''} onChange={set('phone')} type="tel" />
          <Field label="Hours" value={form.hours || ''} onChange={set('hours')} placeholder="e.g. Mon–Fri 11am–10pm" />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  form.amenities?.includes(a)
                    ? 'bg-[#f77f00] text-white border-[#f77f00]'
                    : 'border-gray-300 hover:border-[#f77f00]'
                }`}>{a}</button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Restaurant Photo</label>
          <label className="btn-secondary text-sm cursor-pointer inline-block">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea
        ? <textarea rows={3} className="input" value={value} onChange={onChange} placeholder={placeholder} />
        : <input type={type} className="input" value={value} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  )
}
