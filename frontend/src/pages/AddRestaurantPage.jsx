import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRestaurant, deleteRestaurant, getRestaurant, updateRestaurant, uploadRestaurantPhoto } from '../services/restaurantService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

import { COUNTRY_CODES, STATES_BY_COUNTRY, COUNTRIES, normalizeCountry } from '../utils/locations'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean', 'French', 'Other']
const PRICE_TIERS = ['$', '$$', '$$$', '$$$$']

export default function AddRestaurantPage() {
  const navigate = useNavigate()
  const { restaurantId } = useParams()
  const { isOwner } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    name: '', cuisine_type: '', address: '', city: '', state: '', zip: '', country: '',
    phone: '', description: '', hours: '', price_tier: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(Boolean(restaurantId))
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [dirty, setDirty] = useState(false)
  const isEditing = Boolean(restaurantId)

  useEffect(() => {
    if (!restaurantId) return

    const loadRestaurant = async () => {
      try {
        const res = await getRestaurant(restaurantId)
        const data = res.data
        const cleanPhone = data.phone?.includes(' ') ? data.phone.split(' ')[1] : (data.phone || '').replace(/\D/g, '').slice(-10)
        setForm({
          name: data.name || '',
          cuisine_type: data.cuisine_type || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip_code || '',
          country: normalizeCountry(data.country) || '',
          phone: cleanPhone || '',
          description: data.description || '',
          hours: data.hours || '',
          price_tier: data.price_tier || '',
        })
        setPhotoPreview(data.image_url || '')
        setDirty(false)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load restaurant details.')
      } finally {
        setPageLoading(false)
      }
    }

    loadRestaurant()
  }, [restaurantId])

  const updateForm = (updater) => {
    setDirty(true)
    setForm((current) => updater(current))
  }

  const set = (key) => (e) => updateForm((f) => ({ ...f, [key]: e.target.value }))
  const setCountry = (e) => updateForm((f) => ({ ...f, country: e.target.value, state: '' }))
  const setPhone = (e) => updateForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
  const setZip = (e) => updateForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setDirty(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!isOwner) {
      setError('Only owners can add restaurants.')
      return
    }
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
      const country = normalizeCountry(form.country)
      const fullPhone = form.phone && COUNTRY_CODES[country] ? `${COUNTRY_CODES[country]} ${form.phone}` : form.phone
      const payload = {
        ...form,
        country,
        phone: fullPhone,
        state: form.state ? form.state.toUpperCase() : '',
        zip_code: form.zip,
      }
      const res = isEditing ? await updateRestaurant(restaurantId, payload) : await createRestaurant(payload)
      if (photoFile) {
        await uploadRestaurantPhoto(res.data.id, photoFile)
      }
      setDirty(false)
      showToast(photoFile ? 'Restaurant details and photo saved successfully.' : (isEditing ? 'Restaurant updated successfully.' : 'Restaurant created successfully.'))
      navigate(`/restaurants/${res.data.id}`)
    } catch (err) {
      const message = err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} restaurant.`
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!restaurantId || loading) return
    if (!window.confirm('Delete this restaurant? This action cannot be undone.')) return

    setLoading(true)
    setError('')
    try {
      await deleteRestaurant(restaurantId)
      showToast('Restaurant deleted successfully.')
      navigate('/owner/dashboard')
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete restaurant.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Owner Access Only</h1>
        <p className="text-gray-500">Customers cannot create restaurants. Please use an owner account for restaurant management.</p>
      </div>
    )
  }

  if (pageLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Loading restaurant details...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">{isEditing ? 'Edit Restaurant' : 'Add a Restaurant'}</h1>
        {isEditing && (
          <button type="button" onClick={handleDelete} disabled={loading} className="btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-60">
            Delete Restaurant
          </button>
        )}
      </div>

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
                  onClick={() => updateForm((f) => ({ ...f, price_tier: p }))}
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
            <label htmlFor="restaurant-state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {form.country && STATES_BY_COUNTRY[form.country] ? (
              <select id="restaurant-state" className="input" value={form.state} onChange={(e) => updateForm(f => ({ ...f, state: e.target.value }))}>
                <option value="">Select state...</option>
                {STATES_BY_COUNTRY[form.country].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input 
                id="restaurant-state"
                type="text" 
                className="input" 
                value={form.state} 
                onChange={(e) => updateForm(f => ({ ...f, state: e.target.value }))} 
                placeholder={form.country ? "Enter state/region" : "Select country first"}
                disabled={!form.country}
              />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="restaurant-zip" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input id="restaurant-zip" type="text" className="input" value={form.zip} onChange={setZip} maxLength={5} placeholder="5 digits" />
          </div>
          <div>
            <label htmlFor="restaurant-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                {form.country ? COUNTRY_CODES[form.country] || '+' : '+?'}
              </span>
              <input 
                id="restaurant-phone"
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

        <div>
          <label htmlFor="restaurant-photo" className="block text-sm font-medium text-gray-700 mb-1">Restaurant Photo</label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 hover:border-[#e1515f] hover:text-[#e1515f]">
            <input id="restaurant-photo" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview ? 'Change photo' : isEditing ? 'Upload or replace restaurant photo' : 'Choose a restaurant photo to upload after save'}
          </label>
          {photoPreview && (
            <img src={photoPreview} alt="Restaurant preview" className="mt-3 h-48 w-full rounded-2xl object-cover border border-gray-200" />
          )}
        </div>

        <button type="submit" disabled={loading || !dirty} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Restaurant')}
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
