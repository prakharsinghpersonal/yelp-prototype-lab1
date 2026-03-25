import { useState, useEffect } from 'react'
import { getProfile, updateProfile, getPreferences, updatePreferences, uploadProfilePhoto } from '../services/userService'

import { COUNTRY_CODES, STATES_BY_COUNTRY, COUNTRIES } from '../utils/locations'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean']
const DIETARY = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Kosher']
const AMBIANCE = ['Casual', 'Fine Dining', 'Family-Friendly', 'Romantic', 'Outdoor']
const PRICE_TIERS = ['$', '$$', '$$$', '$$$$']
const SORT_OPTIONS = ['rating', 'distance', 'popularity', 'price']

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [p, pref] = await Promise.all([getProfile(), getPreferences()])
        
        // Strip any existing country codes from db response so only 10 digits are shown in UI
        let cleanPhone = p.data.phone || ''
        if (cleanPhone && cleanPhone.includes(' ')) {
          cleanPhone = cleanPhone.split(' ')[1] // Gets the 10 digits assuming "+91 1234567890" architecture
        } else {
          cleanPhone = cleanPhone.replace(/\D/g, '')
          if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10)
        }
        
        setProfile({ ...p.data, phone: cleanPhone })
        setPrefs(pref.data || {
          cuisines: [], price_range: '', preferred_locations: [],
          dietary_needs: [], ambiance: [], sort_preference: 'rating',
        })
      } catch {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    
    // Validations
    if (profile.phone && profile.phone.length !== 10) {
      setError('Please enter exactly 10 digits for the phone number.')
      return
    }
    if (profile.state && profile.country && STATES_BY_COUNTRY[profile.country] && !STATES_BY_COUNTRY[profile.country].includes(profile.state)) {
      setError(`Please select a valid state for ${profile.country}.`)
      return
    }

    setSaving(true); setMessage(''); setError('')
    try {
      // Clean up state format before saving
      const dataToSave = { ...profile }
      if (dataToSave.state) dataToSave.state = dataToSave.state.toUpperCase()
      
      // Prepend country code directly for the database
      if (dataToSave.phone && dataToSave.country && COUNTRY_CODES[dataToSave.country]) {
        dataToSave.phone = `${COUNTRY_CODES[dataToSave.country]} ${dataToSave.phone}`
      }
      
      await updateProfile(dataToSave)
      setMessage('Profile updated successfully.')
    } catch {
      setError('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePrefsSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMessage(''); setError('')
    try {
      await updatePreferences(prefs)
      setMessage('Preferences saved.')
    } catch {
      setError('Failed to save preferences.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSaving(true); setMessage(''); setError('')
    try {
      const res = await uploadProfilePhoto(file)
      // Keep our clean phone number state
      setProfile({ ...res.data, phone: profile.phone })
      setMessage('Profile photo updated.')
    } catch {
      setError('Failed to upload photo.')
    } finally {
      setSaving(false)
    }
  }

  const toggleArr = (key, val) =>
    setPrefs((p) => ({
      ...p,
      [key]: p[key]?.includes(val) ? p[key].filter((x) => x !== val) : [...(p[key] || []), val],
    }))

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['profile', 'preferences'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {/* Profile Tab */}
      {tab === 'profile' && profile && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            {profile.profile_pic_url ? (
              <img src={`http://localhost:8000${profile.profile_pic_url}`} alt="Profile" className="w-20 h-20 rounded-full object-cover border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium border">
                {profile.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <label className="btn-secondary cursor-pointer text-sm">
                Change Photo
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PField label="Full Name" value={profile.name || ''} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
            <PField label="Email" value={profile.email || ''} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} type="email" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country First *</label>
              <select className="input" value={profile.country || ''} onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value, state: '' }))}>
                <option value="">Select country...</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                  {profile.country ? COUNTRY_CODES[profile.country] || '+' : '+?'}
                </span>
                <input 
                  type="tel" 
                  className="input rounded-l-none" 
                  value={profile.phone || ''} 
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} 
                  placeholder={profile.country ? "10 digits" : "Select country above"}
                  maxLength={10} 
                  disabled={!profile.country}
                />
              </div>
            </div>

            <PField label="City" value={profile.city || ''} onChange={(v) => setProfile((p) => ({ ...p, city: v }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              {profile.country && STATES_BY_COUNTRY[profile.country] ? (
                <select className="input" value={profile.state || ''} onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))}>
                  <option value="">Select state...</option>
                  {STATES_BY_COUNTRY[profile.country].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input 
                  type="text" 
                  className="input" 
                  value={profile.state || ''} 
                  onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))} 
                  placeholder={profile.country ? "Enter state/region" : "Select country first"}
                  disabled={!profile.country}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select className="input" value={profile.gender || ''} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <PField label="Languages" value={profile.language || ''} onChange={(v) => setProfile((p) => ({ ...p, language: v }))} placeholder="e.g. English, Spanish" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
            <textarea rows={3} className="input" value={profile.about_me || ''} onChange={(e) => setProfile((p) => ({ ...p, about_me: e.target.value }))} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Preferences Tab */}
      {tab === 'preferences' && prefs && (
        <form onSubmit={handlePrefsSave} className="card p-6 space-y-6">
          <Section title="Cuisine Preferences">
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <Chip key={c} label={c} active={prefs.cuisines?.includes(c)} onClick={() => toggleArr('cuisines', c)} />
              ))}
            </div>
          </Section>

          <Section title="Price Range">
            <div className="flex gap-2">
              {PRICE_TIERS.map((p) => (
                <Chip key={p} label={p} active={prefs.price_range === p} onClick={() => setPrefs((pr) => ({ ...pr, price_range: p }))} />
              ))}
            </div>
          </Section>

          <Section title="Dietary Needs">
            <div className="flex flex-wrap gap-2">
              {DIETARY.map((d) => (
                <Chip key={d} label={d} active={prefs.dietary_needs?.includes(d)} onClick={() => toggleArr('dietary_needs', d)} />
              ))}
            </div>
          </Section>

          <Section title="Ambiance Preferences">
            <div className="flex flex-wrap gap-2">
              {AMBIANCE.map((a) => (
                <Chip key={a} label={a} active={prefs.ambiance?.includes(a)} onClick={() => toggleArr('ambiance', a)} />
              ))}
            </div>
          </Section>

          <Section title="Sort Preference">
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((s) => (
                <Chip key={s} label={s} active={prefs.sort_preference === s} onClick={() => setPrefs((p) => ({ ...p, sort_preference: s }))} />
              ))}
            </div>
          </Section>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      )}
    </div>
  )
}

function PField({ label, value, onChange, type = 'text', placeholder, maxLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
        active ? 'bg-brand-teal text-white border-brand-teal' : 'border-gray-300 hover:border-brand-teal'
      }`}
    >
      {label}
    </button>
  )
}
